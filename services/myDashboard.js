'use strict';

var models = require('./../models');
var filters = require('./../models/filters');
var Account = models.Account;
var AccountUser = models.AccountUser;
var Session = models.Session;
var SessionMember = models.SessionMember;
var Subscription = models.Subscription;

var q = require('q');
var _ = require('lodash');
var async = require('async');

var sessionValidator = require('./validators/session.js');
var subscriptionServices = require('./subscription.js');
var subdomains = require('./../lib/subdomains.js');

module.exports = {
  getAllData: getAllData
}

// Exports
function getAllData(userId, protocol, provider) {
  let deferred = q.defer();

  AccountUser.findAll({
    where: { UserId: userId },
    include: [{
      model: SessionMember,
      required: false,
      where: {
       $or: [{typeOfCreation: {$ne: 'system'}}, {role: {$ne: 'observer'}}]
      },
      include: [{
        model: Session,
        include: [{
          model: Account,
          include: [Subscription]
        }]
      }]
    }, Account]
  }).then(function(accountUsers) {
    let object = prepareAccountUsers(accountUsers, protocol);
    return prepareSessions(object, provider);
  }).then(function(object) {
    deferred.resolve(object);
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

// Helpers
function prepareSessions(object, provider) {
  let deferred = q.defer();
  let array = _.map(object, function(role) {
    if(role.field != 'accountManager') {
      return role.data;
    }
  });

  array = _.map(array, function(data) {
    return function(callback) {
      prepareAsync(data, provider).then(function() {
        callback();
      }, function(error) {
        callback(error);
      });
    }
  });

  async.parallel(array, function(error) {
    if(error) {
      deferred.reject(error);
    }
    else {
      deferred.resolve(object);
    }
  });

  return deferred.promise;
}

function prepareAsync(data, provider) {
  let deferred = q.defer();

  async.each(data, function(accountUser, callback) {
    if(accountUser.dataValues.session.Account.admin) {
      sessionValidator.addShowStatus(accountUser.dataValues.session);
      return callback();
    }

    subscriptionServices.getChargebeeSubscription(accountUser.dataValues.session.Account.Subscription.subscriptionId, provider).then(function(chargebeeSub) {
      sessionValidator.addShowStatus(accountUser.dataValues.session, chargebeeSub);
      callback();
    }, function(error) {
      callback(error);
    });
  }, function(error) {
    if(error) {
      deferred.reject(error);
    }
    else {
      deferred.resolve();
    }
  });

  return deferred.promise;
}

function prepareAccountUsers(accountUsers, protocol) {
  let object = {
    accountManager: { name: 'Account Managers', field: 'accountManager', data: [] },
    facilitator: { name: 'Hosts', field: 'facilitator', data: [] },
    participant: { name: 'Guests', field: 'participant', data: [] },
    observer: { name: 'Spectators', field: 'observer', data: [] }
  };

  _.each(accountUsers, function(accountUser) {
    
    if (_.includes(['admin', 'accountManager'], accountUser.role)) {
      userSwitch(object, accountUser, protocol);
    }

    _.each(accountUser.SessionMembers, function(sessionMember) {
      let user = _.cloneDeep(accountUser);
      user.role = sessionMember.role;
      user.SessionMembers = [sessionMember];
      userSwitch(object, user, protocol);
    });
  });

  _.map(object, function(value, key) {
    if(_.isEmpty(value.data)) {
      delete object[key];
    }
    else {
      value.data = _.uniqBy(value.data, function(user) {
        if(user.dataValues.session) {
          return user.dataValues.session.id;
        }
        else {
          return user.id;
        }
      });
    }
  });

  return object;
}

function userSwitch(object, user, protocol) {
  switch(user.role) {
    case 'admin':
    case 'accountManager':
      addDashboardUrl(user, '/account-hub', protocol);
      break;
    case 'facilitator':
      addDashboardUrl(user, '/account-hub#/chatSessions/builder/', protocol);
      addSession(user);
      break;
    case 'participant':
    case 'observer':
      addSession(user);
      break;
  }

  if(user.dataValues.needsSession) {
    if(user.dataValues.session) {
      object[user.role].data.push(user);
    }
  }
  else {
    if(user.role == 'admin') {
      object['accountManager'].data.push(user);
    }
    else {
      object[user.role].data.push(user);
    }
  }
}

function addDashboardUrl(accountUser, path, protocol) {
  if(accountUser.active){
    accountUser.dataValues.dashboardUrl = subdomains.url({ protocol: protocol }, accountUser.Account.subdomain, path);
  }
}

function addSession(accountUser) {
  accountUser.dataValues.needsSession = true;
  let sessionMember = accountUser.SessionMembers[0];

  if(sessionMember) {
    accountUser.dataValues.session = sessionMember.Session.dataValues;
  }
}
