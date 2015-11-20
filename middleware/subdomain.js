"use strict";
var models  = require('./../models');
var config = require('config');
var Account  = models.Account;

module.exports = function(req, res, next) {
  let subdomain = req.subdomains[req.subdomains.length - 1]// last element from array
  if (config.get("server")["baseSubdomain"] !== subdomain ) {
    Account.find({attributes: ['name'], where: { name: subdomain } }).then(function (result) {
      if(result){
        next();
      }else{
        res.status(404).send('Account not Found');
      };
    });
  }else{
    next();
  };
}
