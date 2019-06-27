'use strict';
const promise = require('bluebird');
const log4js = require('log4js');
const moment = require('moment');




module.exports =  ()=>{
    log4js.configure('./logconf/log4js.json');
    const db = require('../dbconnection/dbConnection')
    const logger = log4js.getLogger('');
    /**
     * 
     * @param {string} username For Whom Ticket is raised
     * @param {string} ticket_type which type of ticket user want to raise (REQ,INC)
     * @param {string} issue_category Issue Category
     * @param {string} priority Ticket priority(low,medium,high)
     * @param {string} issue_desc description of the Issue
     * @param {string} raised_by Admin who raise the ticket on behalf of user
     * @param {string} comments comments for the issue
     */
    var saveTicket =async (data)=> {
        try {
            var result = db.dbConn('insert into TICKET_DETAILS_TB (RAISED_FOR,TICKET_NUMBER,TICKET_TYPE,ISSUE_CATEGORY,PRIORITY,ISSUE_DESC,COMMENTS,RAISED_BY,RAISED_ON,LAST_MODIFIED_ON,LAST_MODIFIED_BY,TICKET_STATUS) values ("' + data.username + '","REQ' + Date.now() + '","' + data.ticket_type + '","' + data.issue_category + '","' + data.priority + '","' + data.issue_desc + '","' + data.comments + '","' + data.raised_by + '","' + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + '","' + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + '","' + data.raised_by + '","open");');
            
            logger.info("request is stored in RDS \n" + JSON.stringify(result));
        }
        catch (err) {
            logger.error("unable to store request in database\n" + err);
        }
        
    };
    /**
     * 
     * @param {string} key value for that particular keyword
     */
    var viewTicket = async (key)=> {
        try {
            var result = db.dbConn('select TICKET_NUMBER,TICKET_TYPE,ISSUE_CATEGORY,PRIORITY,ISSUE_DESC,COMMENTS,RAISED_BY,RAISED_ON,LAST_MODIFIED_ON,LAST_MODIFIED_BY,TICKET_STATUS from TICKET_DETAILS_TB where TICKET_NUMBER= "'+key+'";');
            const rows = result;
            return promise.resolve(rows);
        }
        catch (err) {
            logger.error("unable to get record from database viewTicket() \n" + err);
        }   
    };
    /**
     * 
     * @param {string} query_type From which keyword do you want to perform query
     * @param {strig} key Value of Ticket_Status (Open,closed or in progress)
     */
    var listTicket = async (column,key)=> {
        try {
            var result = db.dbConn('select * from TICKET_DETAILS_TB where '+column+'= "'+key+'";');
            const rows = result;
            return promise.resolve(rows);
        }
        catch (err) {
            logger.error("unable to get record from  database listTicket() \n" + err);
        }   
    };

    return {
        "saveTicket":saveTicket,
        "viewTicket":viewTicket,
        "listTicket":listTicket
    };
};