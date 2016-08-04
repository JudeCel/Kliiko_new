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

function getSubdomain(req, debug) {
  debug.getSubdomain = {
    subdomains: req.subdomains,
    skipSubdomains: _.split(process.env.SERVER_SKIP_SUBDOMAINS, ","),
    filtered: _.difference(req.subdomains, _.split(process.env.SERVER_SKIP_SUBDOMAINS, ","))
  }

  let subdomains = req.subdomains
  let skipSubdomains = _.split(process.env.SERVER_SKIP_SUBDOMAINS, ",")
  subdomains = _.difference(req.subdomains, skipSubdomains)


  if (_.last(subdomains)) {
    debug.getSubdomain.lastSubdomain = _.last(subdomains);
    return _.last(subdomains);
  }else{
    debug.getSubdomain.baseSubdomain = process.env.SERVER_BASE_SUBDOMAIN;
    return process.env.SERVER_BASE_SUBDOMAIN
  }
}

function comparedWithBaseDomainName(subdomain, debug) {
  debug.comparedWithBaseDomainName = process.env.SERVER_BASE_SUBDOMAIN !== subdomain;
  return (process.env.SERVER_BASE_SUBDOMAIN !== subdomain );
}

function getAccauntWithRoles(user, subdomain, debug, callback) {
  debug.getAccauntWithRoles = {};

  models.User.find({attributes: ['id'], where: {id: user.id}}).then(function(user){
    debug.getAccauntWithRoles.user = user;

    user.getAccounts({where: {
      $and: [ Sequelize.where(Sequelize.col('subdomain'), subdomain)] },
      include: [ { model: models.AccountUser }], limit: 1 }
    ).then(function(accounts) {
      debug.getAccauntWithRoles.accounts = accounts;
      debug.getAccauntWithRoles.account = accounts[0];
      let account = accounts[0];

      if (account) {
        let result = { id: account.id, subdomain: account.subdomain, accountUser: account.AccountUser }
        debug.getAccauntWithRoles.result = result;
        callback(null, result)
      }else {
        debug.getAccauntWithRoles.notFoundAccount = true;
        callback(true)
      }
    }).catch(function (err) {
      debug.getAccauntWithRoles.catch = err;
      callback(err)
    });
  });
}

function isDomainAvailableForThisUser(req, subdomain, debug, callback) {
  debug.isDomainAvailableForThisUser.user = req.user;

  if (req.user) {
    getAccauntWithRoles(req.user, subdomain, debug, function(error, result) {
      callback(error, result)
    })
  }else{
    debug.isDomainAvailableForThisUser.notFoundUser = true;
    callback(true, null);
  }
}

module.exports = function(req, res, next) {
  let debug = {
    exports: {
      cookies: req.cookies,
      session: req.session,
      subdomain: null,
      notValidResult: null
    },
    getSubdomain: {
      subdomains: null,
      skipSubdomains: null,
      filtered: null,
      lastSubdomain: null,
      baseSubdomain: null
    },
    comparedWithBaseDomainName: null,
    isDomainAvailableForThisUser: {
      user: null,
      notFoundUser: null
    },
    getAccauntWithRoles: {
      user: null,
      accounts: null,
      account: null,
      result: null,
      notFoundAccount: null,
      catch: null
    }
  };

  let subdomain = getSubdomain(req, debug);
  debug.exports.subdomain = subdomain;

  if (comparedWithBaseDomainName(subdomain, debug)) {
    isDomainAvailableForThisUser(req, subdomain, debug, function(error, result){
      if(result){
        assignCurrentDomain(result, res)
        assignCurrentUserInfo(result, req)
        next();
      }else{
        debug.exports.notValidResult = 'Account not found or you do not have access to this page';
        res.status(404).send(debug);
      };
    });
  }else{
    next();
  };
}
