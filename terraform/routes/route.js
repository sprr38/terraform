'use strict';
const express = require('express');
const router = express.Router();
const log4js = require('log4js');


module.exports = (config) => {
    const tfLib = require('../lib/tfLib')(config);
    const ticketLib = require('../lib/ticketLib')(config);
    log4js.configure('./logconf/log4js.json');
    let logger = log4js.getLogger('');

    // important in order to send request to next middleware...
    router.use((req,res,next) => {
        logger.info('Req time: ' + new Date());
        next();
    });
    // route: HTTP POST /launchVpod route
    router.post("/launchVpod", (req, res) => {
		req.setTimeout(0)
        if(!req.body && (!req.body.username) && (!req.body.stack) && (!req.body.instanceType) && (!req.body.duration) && (!req.body.scheduler) ) {
            return res.status(400).send("missing inputs");
        }
        logger.info("Requested parameter from launchVpod : ", JSON.stringify(req.body) +"\n")

        return tfLib.launchVpod(req.body)
        .then((result)=>{
            res.send({"result": result});
        })
        .catch((err)=> {
            logger.error("unable to process your request from launchVpod route\n"+ err);
            return res.status(500).send(err || "Error");
        });
    });
	//HTTP DELETE /destroyVpod route 
    router.delete("/destroyVpod", (req, res) => {
        
        if(!req.body && (!req.body.username) && (!req.body.stack) && (!req.body.instanceType) && (!req.body.duration) && (!req.body.scheduler) ) {
            return res.status(400).send("missing inputs");
        }
        logger.info("Requested parameter from destroyVpod : ", JSON.stringify(req.body)+"\n")

        return tfLib.destroyVpod(req.body)
        .then((result)=>{
            res.send(result);
        })
        .catch((err)=> {
            logger.error("unable to process your request from destroyVpod route\n"+ err);
            return res.status(500).send(err || "Error");
        });
    });
    /*
        HTTP POST /saveTicket route
        This route is used to raised a request by the admin on behalf of user with issue details
    */
    router.post("/saveTicket", (req, res) => {
        
        if(!req.body && (!req.body.username) && (!req.body.ticket_type) && (!req.body.issue_category) && (!req.body.priority) && (!req.body.issue_desc) && (!req.body.comments) && (!req.body.raised_by)  ) {
            return res.status(400).send("missing inputs");
        }
        logger.info("requested parameters for saveTicket : ", JSON.stringify(req.body)+"\n")

        return  ticketLib.saveTicket(req.body)
        .then(()=>{
            return res.status(200).send({"result":"your request has been submitted"})
        })
        .catch((err)=> {
            logger.error("unable to save your request in db: saveTicket Route\n"+ err);
            return res.status(500).send(err || "Error");
        });
    });
    /*
        HTTP GET /viewTicket route
        This route is used to view details of any ticket using Ticket Number
    */
    router.get("/viewTicket", (req, res) => {
        if(!req.query && (!req.query.key)  ) {
            return res.status(400).send("missing inputs");
        }
        logger.info("req.query.key : ", req.query.key)
        return  ticketLib.viewTicket(req.query.key)
        .then((result)=>{
            if(!result.length) {
                res.status(404).send("No Record Found!!");
            }
            else {
                logger.info("Result found from Database for "+req.query.key+": \n"+JSON.stringify(result) );
                return res.status(200).send({"result":result})
            }    
        })
        .catch((err)=> {
            logger.error("unable to fetch record from db: viewTicket Route\n"+ err);
            return res.status(500).send(err || "Error");
        });
    });
    /*
        HTTP GET /listTicket Route
        This route is used to get list of all the tickets considering multiole scenario

    */
    router.get("/listTicket", (req, res) => {
        if(!req.query && (!req.query.key) && (!req.query.columnName) ) {
            return res.status(400).send("missing inputs");
        }
        logger.info("ColumnName of table with its respective value  : ", JSON.stringify(req.query));
        return  ticketLib.listTicket(req.query.columnName,req.query.key)
        .then((result)=>{
            if(!result.length) {
                res.status(404).send("No Record Found!!");
            }
            else {
                logger.info("Result found from Database for "+req.query.key+" Ticket"+": \n"+JSON.stringify(result) );
                return res.status(200)
                .send({
                    "Numbers of Records":result.length,
                    "result":result  
                })
            }    
        })
        .catch((err)=> {
            logger.error("unable to fetch record from db: listTicket route\n"+ err);
            return res.status(500).send(err || "Error");
        });
    });
	return router;
};
