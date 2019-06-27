'use strict';

const express = require('express');
const config = require('./config');
const router = require('./routes/route');
const bodyParser = require('body-parser');
const log4js = require('log4js');

let server = express();

log4js.configure('./logconf/log4js.json');
const logger = log4js.getLogger('');


//cors allow

server.use((req,res,next)=>{
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Headers","Origin, X-Requested-With,Content-Type,Accept");
    next();
});
// support json encoded bodies
server.use(bodyParser.json());

// support encoded bodies
server.use(bodyParser.urlencoded({ extended: false }));

// use router middleware.
server.use(config.ROUTE_VIRTUAL_DIR + '/api', router(config));

// start the server
server.listen(config.SERVER_PORT, (err) => {
    if(err){
        logger.error("something wrong with the port\n"+ err)
    }
    else{
        logger.info("service is started on port: "+ config.SERVER_PORT);
    }
});
