'use strict';
const promise = require('bluebird');
const shell = promise.promisifyAll(require('shelljs'));
const AWS = require("aws-sdk");
const log4js = require('log4js');

module.exports =  (config)=>{
    AWS.config.update({"region": config.sesConf[0].region});
    const db = require('../dbconnection/dbConnection');
    log4js.configure('./logconf/log4js.json');
    const logger = log4js.getLogger('');
    var datetime = new Date();
    /**
     * 
     * @param {string} username The developer username 
     * @param {string} stack   The stack(java,python,nodejs) which will be used for provisioning instance
     * @param {string} instanceType Instance size as per aws convention
     * @param {string} duration  Environment provision time period
     * @param {string} scheduler How long sever will up and running for each 
     */
    var launchVpod = (data)=> {   
        var dir = process.cwd();
        var private_ip;
        var stack = config[data.stack]
        logger.info("Request details\n"+"Username: "+data.username+"\n" +"Stack Name: "+ stack +"\n" +"Instance Size: "+ data.instanceType +"\n"+"Time Period: "+ data.duration + "\n"+"Scheduler: "+ data.scheduler);
        var s3 = new AWS.S3({});
        var terrafomInitCmd = 'cd vpod && echo "no" | terraform init -backend-config="key='+data.username+'/terraform.tfstate"';
        return shell.execAsync(terrafomInitCmd)
        .then((result)=>{
            logger.info("Terraform initialization logs\n"+result);
            return promise.resolve("Terraform Initialized")
        })
        .then(()=>{
            var terrafomApplyCmd= "cd "+dir+"/vpod && terraform apply -auto-approve -var 'username="+data.username+"' -var 'instanceType="+data.instanceType+"' -var 'scheduler="+data.scheduler+"' -var 'stack="+stack+"'  -var 'duration="+data.duration+"'";
            return shell.execAsync(terrafomApplyCmd)
            .then((result)=>{
                logger.info("Terraform apply started at "+"\n"+datetime+"\n"+result);
            })
            .catch((err)=>{
                logger.error("unable to process your request for terraform apply !!!!\n"+ err)
            })
        })
        .then(async ()=>{
            var params = {
                Bucket: config.StateFileBucketName,
                Key: data.username+"/terraform.tfstate"
            }
			try {
                const result = await s3.getObject(params).promise();
                var output = JSON.parse(result.Body.toString());
                const result_2 = output;
                var tfStateoutput = result_2;
                private_ip = tfStateoutput.modules[0].resources["aws_instance.UserInstance"].primary.attributes.private_ip;
                logger.info("Got private Ip from terraform state file : " + private_ip);
            }
            catch (err) {
                logger.error("S3 file reading problem" + err);
                return promise.reject(err);
            }
        })
		.then(()=>{
            return db.dbConn('insert into request_details (username,private_ip,duration,scheduler,instanceType) values ("'+data.username+'","'+private_ip+'","'+data.duration+'","'+data.scheduler+'","'+data.instanceType+'");')
            .then(function(rows){
                logger.info("request is stored in RDS \n"+ JSON.stringify(rows));
            })
            .catch(function(err){
                logger.error("unable to store request in database\n"+ err)
            })
		}) 
        .then(async ()=>{
            var lambda = new AWS.Lambda();
            try {
                await lambda.invoke({
                    FunctionName: config.sesConf[0].lambdaFunctionName /*lambda function name required */,
                    Payload: '{"client_id":' + '"' + data.username + config.emailSuffix + '"' + ',"private_ip":' + '"' + private_ip + '"}'
                })
                .promise();
                logger.info("Vpod launch successfully and details are sent to the user");
                return promise.resolve("user enviroment is created and details are sent to user");
            }
            catch (err) {
                logger.error("unable to send mail" + err);
                return promise.reject(err);
            }
            
        })
        .catch((err)=>{
            logger.error("GLobal catch Block from launchVpod"+ err);
            return promise.reject(err);
        });
    };
    /**
     * 
     * @param {string} username The developer username 
     * @param {string} stack   The stack(java,python,nodejs) which will be used for provisioning instance
     * @param {string} instanceType Instance size as per aws convention
     * @param {string} duration  Environment provision time period
     * @param {string} scheduler How long sever will up and running for each 
     */

    var destroyVpod = (data)=> {
        var dir = process.cwd();
        var terrafomInitCmd = 'cd vpod && echo "no" | terraform init -backend-config="key='+data.username+'/terraform.tfstate"';
        return shell.execAsync(terrafomInitCmd)
        .then(()=>{
            console.log(process.cwd());
            return promise.resolve("Terraform destroy initailaized");
        })
        .then(()=>{
            var terraformDestroyCmd = "cd "+dir+"/vpod && terraform destroy -force -var 'username="+""+data.username+"' -var 'instanceType="+""+data.instanceType+"' -var 'scheduler="+""+data.scheduler+"' -var 'stack="+""+data.stack+"'  -var 'duration="+""+data.duration+"'";
            return shell.execAsync(terraformDestroyCmd)
        })
        .then((result)=>{
            logger.info("Terraform destroy event started at \n"+ datetime +"\n"+ result);
            return promise.resolve("Instance deleted for  "+data.username+ " at "+ datetime );
        })
        .catch((err)=>{
            logger.error("into catch Block destroyVpod: "+ err);
            return promise.reject(err);
        });
        
    };

    return {
        "launchVpod": launchVpod,
        "destroyVpod":destroyVpod
    };
};