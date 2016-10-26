'use strict';

var q = require('q');
var _ = require('lodash');
var async = require('async');

var userFixture = require('./user');
var subscriptionFixture = require('./subscription');
var models = require('../../models');
var SessionMemberService = require('./../../services/sessionMember');

var mainData;
var manualDependencies = {};

//max 4 symbols
const COUNT_NAME = ['one', 'two', 'thre', 'four', 'five', 'six', 'seve', 'eigh'];
const DEPENDENCY_COUNT = {
  participants: 8,
  observers: 1,
  topics: 2
};

module.exports = {
  createChat: createChat,
  brandProjectPreferenceParams: brandProjectPreferenceParams
};

var functionList = [
  function(callback) { createMainAccount(callback) },
  createSessionWithFacilitator,
  createSubAccountsAndSessionMembers,
  createTopics
];

function createChat(dependencies) {
  let deferred = q.defer();

  setDependenciesManually(dependencies);

  async.waterfall(functionList, function(error, result) {
    if(error) {
      deferred.reject(error);
    }
    else {
      deferred.resolve(mainData);
    }
  });

  return deferred.promise;
};

// Main
function createMainAccount(callback) {
  createUserAndOwnerAccount(userParams('chatUser', 'female')).then(function(data) {
    mainData = data;
    subscriptionFixture.createSubscription(data.account.id, data.user.id, function() {}).then(function(subscription) {
      mainData.subscription = subscription;
      callback();
    }, function(error) {
      callback(error);
    });
  }, function(error) {
    callback(error);
  });
}

function createSessionWithFacilitator(callback) {
  models.BrandProjectPreference.find({ where: { accountId: mainData.account.id } }).then(function(preference) {
    models.Session.create(sessionParams(preference.id)).then(function(result) {
      mainData.session = result;
      mainData.preference = preference;
      let params = sessionMemberParams(mainData.accountUser.firstName, 'facilitator', mainData.accountUser.id, 'facilitator');
      return createSessionMember(params);
    }).then(function(data) {
      mainData.facilitator = data;
      mainData.sessionMembers = [data];
      callback();
    }).catch(function(error) {
      callback(error);
    });
  });
}

function createSubAccountsAndSessionMembers(callback) {
  let participants = _.times(getDependency('participants'), function(index) {
    return function(cb) {
      createAccountAndSessionMember(COUNT_NAME[index], 'participant').then(function() {
        cb();
      }, function(error) {
        cb(error);
      });
    };
  });

  let observers = _.times(getDependency('observers'), function(index) {
    return function(cb) {
      createAccountAndSessionMember(COUNT_NAME[index], 'observer').then(function() {
        cb();
      }, function(error) {
        cb(error);
      });
    };
  });

  let functions = _.concat(participants, observers);
  async.waterfall(functions, function(error) {
    callback(error);
  });
}

function createTopics(callback) {
  mainData.topics = [];

  let functions = _.times(getDependency('topics'), function(index) {
    return function(cb) {
      let topic = { accountId: mainData.account.id, name: 'Cool Topic'+(index+1), boardMessage: 'Say something nice if you wish!' };
      let sessionTopic = { name: 'Cool Session Topic'+(index+1), boardMessage: 'Heyhey'+(index+1) };

      mainData.session.createTopic(topic, sessionTopic).then(function(topic) {
        models.SessionTopics.update({ order: index }, { where: { topicId: topic.id } });
        mainData.topics.push(topic);
        cb();
      }).catch(function(error) {
        cb(error);
      });
    }
  });

  async.waterfall(functions, function(error) {
    callback(error);
  });
}

// Helpers
function createAccountAndSessionMember(index, role, gender) {
  let deferred = q.defer();
  let name = (role + index);

  createUserAndOwnerAccount(userParams(name, gender), role).then(function(result) {
    let params = sessionMemberParams(result.accountUser.firstName, role, result.accountUser.id, name);
    return createSessionMember(params);
  }).then(function(member) {
    mainData.sessionMembers.push(member);
    deferred.resolve();
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function createSessionMember(params) {
  let deferred = q.defer();

  SessionMemberService.createWithTokenAndColour(params).then(function(result) {
    deferred.resolve(result);
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function createUserAndOwnerAccount(params, role) {
  let deferred = q.defer();

  userFixture.createUserAndOwnerAccount(params).then(function(data) {
    if(role) {
      let newParams = data.accountUser.dataValues;
      newParams.role = role;
      newParams.AccountId = mainData.account.id;
      delete newParams.id;
      delete newParams.owner;

      models.AccountUser.create(newParams).then(function(accountUser) {
        data.accountUser = accountUser;
        deferred.resolve(data);
      }, function(error) {
        deferred.reject(error);
      });
    }
    else {
      deferred.resolve(data);
    }
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

// Params
function userParams(name, gender) {
  return {
    accountName: name,
    firstName: name,
    lastName: name,
    password: 'qwerty123',
    gender: gender || 'male',
    email: `${name}@insider.com`,
    confirmedAt: new Date()
  };
}

function sessionMemberParams(name, role, accountUserId, token) {
  return {
    role: role,
    accountUserId: accountUserId,
    username: name,
    token: token,
    sessionId: mainData.session.id
  };
}

function sessionParams(preferenceId) {
  let startTime = new Date();
  return {
    status: 'open',
    accountId: mainData.account.id,
    name: 'cool session',
    type: 'focus',
    startTime: startTime,
    endTime: startTime.setHours(startTime.getHours() + 2000),
    timeZone: 'Europe/Riga',
    brandProjectPreferenceId: preferenceId
  };
}

function brandProjectPreferenceParams() {
  return {
    name: 'Default scheme',
    type: 'focus',
    accountId: mainData.account.id
  };
}

function setDependenciesManually(dependencies) {
  if(dependencies) {
    manualDependencies = {
      participants: dependencies.participants,
      observers: dependencies.observers,
      topics: dependencies.topics
    };
  }
}

function getDependency(dependency) {
  return manualDependencies[dependency] || DEPENDENCY_COUNT[dependency];
}
