'use strict';

var models  = require('./../models');
var Sequelize = models.sequelize;
var policy = require('./policy');
var Account  = models.Account;
var _ = require('lodash');
var constants = require('../util/constants');
var libSubdomains = require('./../lib/subdomains');
var MessagesUtil = require('./../util/messages');

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
  let subdomains = req.subdomains
  let skipSubdomains = _.split(process.env.SERVER_SKIP_SUBDOMAINS, ",")
  subdomains = _.difference(req.subdomains, skipSubdomains)


  if (_.last(subdomains)) {
    return _.last(subdomains);
  }else{
    return process.env.SERVER_BASE_SUBDOMAIN
  }
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
        if(account.AccountUser.active) {
          let result = { id: account.id, subdomain: account.subdomain, accountUser: account.AccountUser }
          callback(null, result)
        }
        else {
          callback(MessagesUtil.middleware.subdomain.deactivated);
        }
      }else {
        callback(true)
      }
    }).catch(function (err) {
      callback(err)
    });
  });
}

function isDomainAvailableForThisUser(req, res, subdomain, callback) {
  if (req.user) {
    getAccauntWithRoles(req.user, subdomain, function(error, result) {
      callback(error, result)
    })
  }else{
    req.session.destroy(function() {
      res.redirect(libSubdomains.url(req, libSubdomains.base, "/"));
    })
  }
}

module.exports = function(req, res, next) {
  let subdomain = getSubdomain(req);

  if (comparedWithBaseDomainName(subdomain)) {
    isDomainAvailableForThisUser(req, res, subdomain, function(error, result){
      if(result){
        assignCurrentDomain(result, res)
        assignCurrentUserInfo(result, req)
        next();
      }else{
        res.status(404).send(MessagesUtil.middleware.subdomain.noAccessOrNotFound);
      };
    });
  }else{
    next();
  };
}
