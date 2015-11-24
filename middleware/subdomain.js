"use strict";
var models  = require('./../models');
var config = require('config');
var Account  = models.Account;
var _ = require('lodash');

function assignCurrentDomain(result, req, next) {
  req.currentDomain = {name: result.name, roles: result.roles}
  next();
}

function getSubdomain(req) {
  return _.last(req.subdomains);
}

function comparedWithBaseDomainName(subdomain) {
  return (config.get("server")["baseSubdomain"] !== subdomain );
}

function getAccauntWithRoles(user, subdomain, callback) {
  models.User.find({attributes: ['id'], where: {id: user.id}}).then(function(user){
    user.getAccounts({where: {name: subdomain},
      include: [ { model: models.AccountUser, attributes: ["role"] }]}
    ).then(function(accounts) {
      if (accounts[0]) {
        let result = {name: subdomain, roles: [accounts[0].AccountUser.role]}
        callback(null, result)
      }else {
        callback(false, null)
      }
    });
  });
}

function isDomainAvailableForthisUser(req, subdomain, callback) {
  if (req.user) {
    getAccauntWithRoles(req.user, subdomain, function(error, result) {
      callback(error, result)
    })
  }else{
    callback(false, null);
  }
}

module.exports = function(req, res, next) {
  let subdomain = getSubdomain(req);
  if (comparedWithBaseDomainName(subdomain)) {
    isDomainAvailableForthisUser(req, subdomain, function(error, result){
      if(result){
        assignCurrentDomain(result, req, next)
      }else{
        res.status(404).send('Account not found or you do not have access to this page');
      };
    })
  }else{
    next();
  };
}