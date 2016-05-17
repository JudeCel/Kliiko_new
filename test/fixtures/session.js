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
  gender: "female",
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
},{
  accountName: "participant",
  firstName: "participant Dainis",
  lastName: "participant Lapins",
  password: "qwerty123",
  gender: "male",
  email: "participant@insider.com",
  confirmedAt: new Date()
},{
  accountName: "observerUser",
  firstName: "Observer",
  lastName: "Observer",
  password: "qwerty123",
  gender: "male",
  email: "Observer@insider.com",
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
    },
    function(cb) {
      createUser(userlist[2], function(error, results) {
        userData[2] = results;
        cb(error);
      });
    }
  ], function(error) {
    let params = userlist[1];
    params.AccountId = userData[0].account.id;
    params.UserId = userData[1].user.id;

    AccountUser.create(params).then(function(result) {
      userData[1].account.AccountUser = result;
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
  async.parallel([
    function(cb) {
      session.createTopic({ accountId: userData[0].account.id, name: "Cool Topic" }, {name: "Cool  Session Topic 1"})
      .then(function (_result) {
        cb(null, {session: session, brandProject: brandProject});
      })
      .catch(function (error) {
        cb(error);
      });
    },
    function(cb) {
      session.createTopic({ accountId: userData[0].account.id, name: "Cool Topic 2" }, {name: "Cool  Session Topic 2"})
      .then(function (_result) {
        cb(null,  {session: session, brandProject: brandProject});
      })
      .catch(function (error) {
        cb(error);
      });
    }
  ], function(error, _results) {
    if (error) {
      callback(error);
    }else {
      callback(null, session, brandProject);
    }
  });
}

function addSessionMembers(erorr, session, callback) {
  async.parallel([
    function(cb) {
      addSessionMember(userData[0].account.AccountUser.id, session, 'participant', 'Participant - AccountOwner', 'participant', cb);
    },
    function(cb) {
      addSessionMember(userData[1].account.AccountUser.id, session, 'facilitator', 'Facilitator - AccountManager','facilitator', cb);
    },
    function(cb) {
      addSessionMember(userData[2].account.AccountUser.id, session, 'participant', 'participant', 'participant2', cb);
    },
    function(cb) {
      addSessionMember(userData[2].account.AccountUser.id, session, 'observer', 'observer', 'observer', cb);
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

function addSessionMember(accountUserId, session, role, name, token, callback) {

  let params = { role: role,
                 accountUserId: accountUserId,
                 username: name,
                 token: token,
                 sessionId: session.id
                }
  SessionMemberService.createWithTokenAndColour(params).then(function(result) {
    callback(null, result);
  }).catch(function(error) {
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
        }, BrandProjectPreference, SessionMember]
      }).then(function(session) {
        let returnParams = {
          sessionMembers: session.SessionMembers,
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
    startTime: startTime,
    endTime: startTime.setHours(startTime.getHours() + 2000),
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
