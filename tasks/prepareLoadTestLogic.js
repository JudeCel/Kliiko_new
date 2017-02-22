'use strict';

require('dotenv-extended').load({
  errorOnMissing: true
});

let models = require("../models");
let Bluebird = require('bluebird');
var usersServices  = require('./../services/users');
var subscriptionService = require('./../services/subscription');
var sessionMemberService = require('./../services/sessionMember');

const USERS_COUNT = 50;
const USERS_PLAN = 'senior_yearly';
const USERS_EMAIL = 'loadTesting@insider.com';
const USERS_PASSWORD = 'Qwerty123';
const SYMBOLS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];

function getUserEmail(index) {
  if (index == 0) {
    return USERS_EMAIL;
  } else {
    return USERS_EMAIL.replace("@", "+" + index + "@");
  }
}

function getUserName(index) {
  let res = SYMBOLS.reduce(function(previousValue, currentValue, index, array) {
    return previousValue.replace(new RegExp(index.toString(), 'g'), currentValue);
  }, index.toString());
  while (res.length < 4) {
    res = SYMBOLS[0] + res;
  }
  return res;
}

function generateIndexesArray(first, last) {
  let arr = [];
  for (var i = first; i <= last; i++) {
    arr.push(i);
  }
  return arr;
}

function createUsers() {
  return new Bluebird((resolve, reject) => {
    let indexes = generateIndexesArray(0, USERS_COUNT - 1);
    Bluebird.each(indexes, (index) => {
      return createUser(index);
    }).then(() => {
      resolve();
    }, (error) => {
      reject(error);
    });
  });
}

function createUser(index) {
  return new Bluebird((resolve, reject) => {
    createUserByParams(getUserParams(index)).then((data) => {
      return createSubscription(data.account.id, data.user.id);
    }).then(() => {
      resolve();
    }).catch(function(error) {
      reject(error);
    });
  });
}

function createUserByParams(params) {
  return new Bluebird((resolve, reject) => {
    usersServices.create(params, (error, user) => {
      if (error) {
        reject(error);
      } else {
        user.getOwnerAccount().then((accounts) => {
          models.AccountUser.find({
            where: {
              UserId: user.id,
              AccountId: accounts[0].id
            }
          }).then((accountUser) => {
            resolve({ user: user, account: accounts[0], accountUser: accountUser });
          }).catch((error) => {
            reject(error);
          })
        });
      }
    });
  });
}

function getUserParams(index) {
  let name = getUserName(index);
  return {
    accountName: name,
    firstName: name,
    lastName: name,
    password: USERS_PASSWORD,
    gender: 'male',
    email: getUserEmail(index),
    confirmedAt: new Date()
  };
}

function createSubscription(accountId, userId) {
  return new Bluebird((resolve, reject) => {
    let uid = "LoadTest_" + accountId + "_" + userId;
    let provider = getSubscriptionProvider(uid);
    subscriptionService.createSubscription(accountId, userId, provider).then(() => {
      resolve();
    }, (error) => {
      reject(error);
    });
  });
}

function getSubscriptionProvider(uid) {
  return function() {
    return {
      request: function(callback) {
        callback(null, {
          subscription: { id: uid, plan_id: USERS_PLAN },
          customer: { id: uid }
        });
      }
    }
  }
}

function createSessions() {
  return new Bluebird((resolve, reject) => {
    createSession("TestFocus", "focus", 0, 1, 8).then((data) => {
      return createSession("TestForum", "forum", 0, 9, USERS_COUNT - 1);
    }).then(() => {
      resolve();
    }).catch(function(error) {
      reject(error);
    });
  });
}

function createSession(name, type, ownerIndex, firstParticipantIndex, lastParticipantIndex) {
  return new Bluebird((resolve, reject) => {
    console.log("Session: " + name);
    let session = null;
    let accountUser = null;
    models.AccountUser.find({ where: { email: getUserEmail(ownerIndex)} }).then((owner) => {
      accountUser = owner;
      let sessionParams = getSessionParams(name, type, accountUser.AccountId);
      return models.Session.create(sessionParams);
    }).then((newSession) => {
      session = newSession;
      return createTopic(session);
    }).then(() => {
      return createSessionMember(accountUser, session.id, 'facilitator');
    }).then(() => {
      let indexes = generateIndexesArray(firstParticipantIndex, lastParticipantIndex);
      return Bluebird.each(indexes, (index) => {
        return createSessionMemberByIndex(index, session.id, "participant");
      });
    }).then(() => {
      resolve();
    }).catch(function(error) {
      reject(error);
    });
  });
}

function createTopic(session) {
  return new Bluebird((resolve, reject) => {
    let topic = { accountId: session.accountId, name: session.name + "Topic", boardMessage: 'TestTopic' };
    let sessionTopic = { name: session.name + "Topic", boardMessage: "TestTopic" };
    session.createTopic(topic, sessionTopic).then(function(topic) {
      resolve();
    }).catch(function(error) {
      reject(error);
    });
  });
}

function createSessionMemberByIndex(index, sessionId, role) {
  return new Bluebird((resolve, reject) => {
    models.AccountUser.find({ where: { email: getUserEmail(index)} }).then((accountUser) => {
      return createSessionMember(accountUser, sessionId, role);
    }).then(() => {
      resolve();
    }).catch(function(error) {
      reject(error);
    });
  });
}

function createSessionMember(accountUser, sessionId, role) {
  return new Bluebird((resolve, reject) => {
    let params = getSessionMemberParams(accountUser.firstName, role, accountUser.id, sessionId);
    sessionMemberService.createWithTokenAndColour(params).then(() =>  {
      console.log(accountUser.email, params.token);
      resolve();
    }, (error) => {
      reject(error);
    });
  });
}

function getSessionParams(name, type, accountId) {
  let startTime = new Date();
  return {
    status: 'open',
    accountId: accountId,
    name: name,
    type: type,
    anonymous: false,
    startTime: startTime,
    endTime: startTime.setYear(startTime.getYear() + 1),
    timeZone: 'Europe/Riga'
  };
}

function getSessionMemberParams(name, role, accountUserId, sessionId) {
  return {
    role: role,
    accountUserId: accountUserId,
    username: name,
    token: "Token_" + sessionId + "_" + accountUserId,
    sessionId: sessionId
  };
}

module.exports = {
  createUsers: createUsers,
  createSessions: createSessions
}
