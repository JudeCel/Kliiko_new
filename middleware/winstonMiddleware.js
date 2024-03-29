'use strict';

var winston = require('winston');
var expressWinston = require('express-winston');

const logger = () => {
  return expressWinston.logger({
    meta: true,
    ignoreRoute: (req, res) => 
    { 
      let skipList = ["/favicon.ico"]
      return(skipList.indexOf(req.path) > -1); 
    },
    dynamicMeta: (req, res) => {
      return {
        currentResources: (req.currentResources ||  {}),
        application: process.env.APPLICATION_NAME
      }
    },
    transports: [
      new winston.transports.Console({
        json: true
      }),
      new winston.transports.Http({
        host: process.env.LOG_SERVER_URL, 
        port: process.env.SERVER_CHAT_DOMAIN_PORT,
        path: "connection-logs"
      })
    ]
  })
}

const errorLogger = () => {
  return expressWinston.errorLogger({
    dynamicMeta: (req, res) => {
      return {
        currentResources: (req.currentResources ||  {}),
        application: process.env.APPLICATION_NAME
      }
    },
    transports: [
      new winston.transports.Console({
        json: true
      }),
      new winston.transports.Http({
        host: process.env.LOG_SERVER_URL, 
        port: process.env.SERVER_CHAT_DOMAIN_PORT,
        path: "connection-logs"
      })
    ]
  });
}

module.exports = {
  logger: logger,
  errorLogger: errorLogger
  
}
