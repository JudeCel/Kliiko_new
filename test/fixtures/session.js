'use strict';

var UserService = require('./../../services/users');
var SessionMemberService = require('./../../services/sessionMember');
var models = require('../../models');
var Session = models.Session;
var BrandProject = models.BrandProject;
var SessionMember = models.SessionMember;
var Account = models.Account;
var AccountUser = models.AccountUser;
var BrandProjectPreference = models.BrandProjectPreference;
var Topic = models.Topic;
var async = require('async');
var q = require('q');

var userData = { };
var userlist = [{
  accountName: "chatUser",
  firstName: "First user",
  lastName: "Last",
  password: "qwerty123",
  gender: "male",
  email: "chatUser@insider.com",
  confirmedAt: new Date()
},{
  accountName: "dainisl",
  firstName: "Dainis",
  lastName: "Lapins",
  password: "qwerty123",
  gender: "male",
  email: "dainisl@insider.com",
  confirmedAt: new Date()
}]

let createNewChatFunctionList = [
  function(callback) { createUsers(callback) },
  createSession,
  crateBrandProject,
  createTopic,
  addSessionMembers
]

function createUsers(callback) {
  async.parallel([
    function(cb) {
      createUser(userlist[0], function(error, results) {
        userData[0] = results;
        cb(error);
      });
    },
    function(cb) {
      createUser(userlist[1], function(error, results) {
        userData[1] = results;
        cb(error);
      });
    }
  ], function(error) {
    let params = userlist[1];
    params.AccountId = userData[0].account.id;
    params.UserId = userData[1].user.id;

    AccountUser.create(params).then(function(result) {
      callback();
    }, function(error) {
      callback(error);
    });
  });
}

function createUser(data, callback) {
  UserService.create(data, function(error, user) {
    if(error) {
      callback(error);
    }
    else {
      user.getOwnerAccount().then(function(accounts) {
        let params = {
          user: user,
          account: accounts[0]
        }

        callback(null, params);
      });
    }
  });
}

function createSession(callback) {
  let params = sessionParams(userData[0].account.id, userData[1].account.AccountUser.id);
  Session.create(params).then(function(result) {
    addBrandProjectPreferences(result, userData[0].account.id, function(error) {
      callback(error, result);
    });
  }).catch(Session.sequelize.ValidationError, function(error) {
    console.log(error);
    callback(error);
  }).catch(function(error) {
    console.log(error);
    callback(error);
  });
}

function crateBrandProject(session, callback) {
  session.createBrandProject(brandProjectParams()).then(function(result) {
    callback(null, session, result);
  }).catch(BrandProject.sequelize.ValidationError, function(error) {
    console.log(error);
    callback(error);
  }).catch(function(error) {
    console.log(error);
    callback(error);
  });
};

function createTopic(session, brandProject, callback) {
  session.createTopic({ accountId: userData[0].account.id, name: "Cool Topic" })
  .then(function (_result) {
    callback(null, session, brandProject);
  })
  .catch(function (error) {
    callback(error);
  });
}

function addSessionMembers(erorr, session, callback) {
  async.parallel([
    function(cb) {
      addSessionMember(userData[0].account.AccountUser.id, session,'facilitator', 'Cool first user', cb);
    },
    function(cb) {
      addSessionMember(userData[1].account.AccountUser.id, session, 'participant','Cool second user', cb);
    }
  ], function(error, results) {
    callback(error, results);
  });
}

function addBrandProjectPreferences(session, accountId, callback) {
  let attrs = brandProjectPreferenceParams(accountId);

  BrandProjectPreference.create(attrs).then(function(result) {
    result.setSession(session);
    callback(null);
  }).catch(function (error) {
    callback(error);
  });
}

function addSessionMember(accountUserId, session, role, name, callback) {

  let params = { role: role,
                 accountUserId: accountUserId,
                 username: name,
                 avatar_info: "0:4:3:1:4:3" }
  session.createSessionMember(params).then(function(result) {
    SessionMemberService.createToken(result.id).then(function() {
      callback(null, result);
    },function(error) {
      callback(error);
    })
  })
  .catch(function(error) {
    callback(error);
  });
}

function createChat() {
  let deferred = q.defer();

  async.waterfall(createNewChatFunctionList, function (error, result) {
    if(error) {
      deferred.reject(error);
    }
    else {
      Session.find({
        where: { id: result[0].sessionId },
        include: [{
          model: Account,
          include: [models.User]
        }, BrandProjectPreference]
      }).then(function(session) {
        let returnParams = {
          session: session,
          account: session.Account,
          user: session.Account.Users[0],
          preference: session.BrandProjectPreference
        };

        deferred.resolve(returnParams);
      });
    }
  });

  return deferred.promise;
};

function brandProjectPreferenceParams(accountId) {
  return {
    name: 'Default scheme',
    accountId: accountId
  };
}

function brandProjectParams() {
  return {
    name: "cool brand project",
    session_replay_date: new Date().setHours(new Date().getHours() + 2000),
    enable_chatroom_logo: 0,
    moderator_active: 1
  };
}

function sessionParams(accountId, facilitatorId) {
  let startTime = new Date();
  return {
    facilitatorId: facilitatorId,
    accountId: accountId,
    name: "cool session",
    start_time: startTime,
    end_time: startTime.setHours(startTime.getHours() + 2000),
    status_id: 1,
    colours_used: '["3","6","5"]'
  };
}

module.exports = {
  createChat: createChat,
  brandProjectPreferenceParams: brandProjectPreferenceParams,
  brandProjectParams: brandProjectParams,
  sessionParams: sessionParams
};
