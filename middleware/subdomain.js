"use strict";
var models  = require('./../models');
var Sequelize = models.sequelize;
var policy = require('./policy');
var Account  = models.Account;
var _ = require('lodash');
var constants = require('../util/constants');

function assignCurrentDomain(result, res) {
  res.locals.currentDomain = { id: result.id, name: result.subdomain, roles: [result.accountUser.role] };
  res.locals.hasAccess = policy.hasAccess;
}

function assignCurrentUserInfo(result, req) {
  _.merge(req.user, _.pick(result.accountUser.dataValues, prepareValidAccountUserParams()));
  req.user.accountUserId = result.accountUser.id;
}

function prepareValidAccountUserParams() {
  let safeAccountUserParams = _.cloneDeep(constants.safeAccountUserParams);
  let index = safeAccountUserParams.indexOf('id');
  safeAccountUserParams.splice(index, 1);
  return safeAccountUserParams;
}

function getSubdomain(req) {
  return _.last(req.subdomains);
}

function comparedWithBaseDomainName(subdomain) {
  return (process.env.SERVER_BASE_SUBDOMAIN !== subdomain );
}

function getAccauntWithRoles(user, subdomain, callback) {
  models.User.find({attributes: ['id'], where: {id: user.id}}).then(function(user){
    user.getAccounts({where: {
      $and: [ Sequelize.where(Sequelize.col('subdomain'), subdomain)] },
      include: [ { model: models.AccountUser }], limit: 1 }
    ).then(function(accounts) {
      let account = accounts[0];

      if (account) {
        let result = { id: account.id, name: subdomain, accountUser: account.AccountUser }
        callback(null, result)
      }else {
        callback(true)
      }
    }).catch(function (err) {
      callback(err)
    });
  });
}

function isDomainAvailableForThisUser(req, subdomain, callback) {
  if (req.user) {
    getAccauntWithRoles(req.user, subdomain, function(error, result) {
      callback(error, result)
    })
  }else{
    callback(true, null);
  }
}

module.exports = function(req, res, next) {
  let subdomain = getSubdomain(req);
  if (comparedWithBaseDomainName(subdomain)) {
    isDomainAvailableForThisUser(req, subdomain, function(error, result){
      if(result){
        assignCurrentDomain(result, res)
        assignCurrentUserInfo(result, req)
        next();
      }else{
        res.status(404).send('Account not found or you do not have access to this page');
      };
    })
  }else{
    next();
  };
}
