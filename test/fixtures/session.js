'use strict';

var UserService = require('./../../services/users');
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
  (cb) => {createSession(cb)},
  crateBrandProject,
  createTopic,
  addSessionMembers
]

function createSession(callback) {
  let sessionAttrs = sessionParams();

  Session.create(sessionAttrs).then(function(result) {
    callback(null, result);
  }).catch(Session.sequelize.ValidationError, function(err) {
    console.log(err);
    callback(err);
  }).catch(function(err) {
    console.log(err);
    callback(err);
  });
}

function crateBrandProject(session, callback) {
  let brandProjectAttrs = brandProjectParams();

  session.createBrandProject(brandProjectAttrs).then(function(result) {
    callback(null, session, result);
  }).catch(BrandProject.sequelize.ValidationError, function(err) {
    console.log(err);
    callback(err);
  }).catch(function(err) {
    console.log(err);
    callback(err);
  });
};

function createTopic(session, brandProject, callback) {
  session.createTopic({ name: "Cool Topic" })
  .then(function (_result) {
    callback(null, session, brandProject);
  })
  .catch(function (error) {
    callback(error);
  });
}

function addSessionMembers(erorr, session, callback) {
  async.parallel([
    (cb) =>  {
      UserService.create(userlist[0], function(errors, user) {
        if(errors) {return cb(errors)};
        Account.find({
          include: [{
            model: AccountUser,
            where: { UserId: user.id }
          }]
        }).then(function(account) {
          account.addSession(session);
          addBrandProjectPreferences(session, account, function(error) {
            if(error) {
              cb(error);
            }
            else {
              addSessionMember(user, session,'facilitator', 'Cool first user', cb);
            }
          })
        })
      })
    },
    (cb) => {
      UserService.create(userlist[1], function(errors, user) {
        if(errors) {return cb(errors)};
        addSessionMember(user, session, 'participant','Cool second user', cb);
      });
    }
  ],
    function(err, results) {
      callback(err, results);
  });
}

function addBrandProjectPreferences(session, account, callback) {
  let attrs = brandProjectPreferenceParams(account.id);

  BrandProjectPreference.create(attrs).then(function(result) {
    result.setSession(session);
    callback(null);
  }).catch(function (error) {
    callback(error);
  });
}

function addSessionMember(user, session, role, name, callback) {

  let params = { role: role,
                 userId: user.id,
                 username: name,
                 avatar_info: "0:4:3:1:4:3" }
  session.createSessionMember(params)
  .then(function (result) {
    callback(null, result );
  })
  .catch(function (error) {
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

function sessionParams() {
  let startTime = new Date();
  return {
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
