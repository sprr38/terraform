'use strict';
const log4js = require('log4js');
const mysql = require('promise-mysql');
const config = require('../config')

    log4js.configure('./logconf/log4js.json');
    const logger = log4js.getLogger('');
    /**
     * 
     * @param {string} dbQuery It takes query as an input and create connection with 
     *                          Mysql Db and send result
     */
   function dbConn(dbQuery) {
       return mysql.createConnection({
                host: config.RDS_Details[0].host,
                user: process.env.DB_USERNAME,
                password: process.env.DB_PASSWORD,
                database: config.RDS_Details[0].dbName
            })  
        .then((conn)=>{
            var result = conn.query(dbQuery);
            conn.end();
            logger.info("connection done and query processed");
            return result;
        })
    
    };
    module.exports.dbConn = dbConn;
    
