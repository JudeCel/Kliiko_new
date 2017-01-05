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
  res.locals.currentDomain = {
    accountUserId: result.id,
    id: result.Account.id,
    name: result.Account.name,
    roles: [result.role]
  };
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
  models.AccountUser.find({
    attributes: ['id', 'role'],
    active: true,
    include: [
      { model: models.User,
        where: { id: user.id },
        attributes: ['id'],
        required: true
      },
      { model: models.Account,
        attributes: ['id', 'name'],
        where: {$and: [ Sequelize.where(Sequelize.col('subdomain'), subdomain)]},
        required: true
      }
    ]
  }).then(function(accountUser){
    if (accountUser) {
      callback(null, accountUser)
    }else{
      callback(MessagesUtil.middleware.subdomain.deactivated);
    }
  }).catch(function (err) {
    callback(err)
  });;
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
        next();
      }else{
        res.status(404).send(MessagesUtil.middleware.subdomain.noAccessOrNotFound);
      };
    });
  }else{
    next();
  };
}
