'use strict';

var UserService = require('./../services/users');
var models = require('../models');
var Session = models.Session;
var BrandProject = models.BrandProject;
var SessionMember = models.SessionMember;
var BrandProjectPreference = models.BrandProjectPreference;
var Topic = models.Topic;
var async = require('async');

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
  addBrandProjectPreferences,
  createTopic,
  addSessionMembers
]

function createSession(callback) {
  let startTime = new Date();

  let sessionAttrs = {
    name: "cool session",
    start_time: startTime,
    end_time: startTime.setHours(startTime.getHours() + 2000),
    status_id: 1,
    colours_used: '["3","6","5"]'
  }
  console.log("Start build session");

  Session.create(sessionAttrs).then(function(result) {
    console.log("Build session is done!");
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
  let brandProjectAttrs = {
    name: "cool brand project",
    session_replay_date: new Date().setHours(new Date().getHours() + 2000),
    enable_chatroom_logo: 0,
    moderator_active: 1
  }

  session.createBrandProject(brandProjectAttrs).then(function(result) {
    console.log("brandProject is done!");
    callback(null, session, result);
  }).catch(BrandProject.sequelize.ValidationError, function(err) {
    console.log(err);
    callback(err);
  }).catch(function(err) {
    console.log(err);
    callback(err);
  });
};


function addBrandProjectPreferences(session, brandProject, callback) {
  let attrs = {
    sessionId: session.id,
    brand_project_id: brandProject.id
  };

  BrandProjectPreference.create(attrs)
  .then(function (_result) {
    callback(null, session, brandProject);
  })
  .catch(function (error) {
    callback(error);
  });
}

function createTopic(session, brandProject, callback) {
  session.createTopic({ name: "Cool Topic" })
  .then(function (_result) {
    callback(null, session, brandProject);
  })
  .catch(function (error) {
    callback(error);
  });
}

function addSessionMembers(session, callback) {
  console.log("added Session Member");
  async.parallel([
    (cb) =>  {
      UserService.create(userlist[0], function(errors, user) {
        if(errors) {return cb(errors)};
        addSessionMember(user, session, cb);
      })
    },
    (cb) => {
      UserService.create(userlist[1], function(errors, user) {
        if(errors) {return cb(errors)};
        addSessionMember(user, session, cb);
      });
    }
  ],
    function(err, results) {
      callback(err, results);
  });
}

function addSessionMember(user, session, callback) {

  let params = { role: "facilitator",
                 userId: user.id,
                 username: "cool user",
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
  async.waterfall(createNewChatFunctionList, function (error, result) {
    if (error) {
      console.log("wee get error:" + error);
    }
    console.log("Done!!");
    process.exit();
  });
};

createChat();
