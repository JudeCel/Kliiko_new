'use strict';

var UserService = require('./../services/users');
var models = require('../models');
var Session = models.Session;
var BrandProject = models.BrandProject;
var SessionMember = models.SessionMember;
var BrandProjectPreference = models.BrandProjectPreference;
var Topic = models.Topic;
var async = require('async');

var userAttrs = {
  accountName: "chatUser",
  firstName: "insiderFirstName",
  lastName: "insiderLastName",
  password: "qwerty123",
  gender: "male",
  email: "chatUser@insider.com",
  confirmedAt: new Date()
}

let createNewChatFunctionList = [
  function (cb) {
    UserService.create(userAttrs, function(errors, user) {
      cb(errors, user)
    });
  },
  createSession,
  crateBrandProject,
  addedSessionMember,
  addBrandProjectPreferences,
  createTopic
]

function createSession(user, callback) {
  let startTime = new Date();

  let sessionAttrs = {
    name: "coolChat",
    start_time: startTime,
    end_time: startTime.setHours(startTime.getHours() + 2000),
    status_id: 1,
    colours_used: '["3","6","5"]'
  }
  console.log("Start build session");

  Session.create(sessionAttrs).then(function(result) {
    console.log("Build session is done!");
    callback(null, user, result);
  }).catch(Session.sequelize.ValidationError, function(err) {
    console.log(err);
    callback(err);
  }).catch(function(err) {
    console.log(err);
    callback(err);
  });
}

function crateBrandProject(user, session, callback) {
  let brandProjectAttrs = {
    name: "cool brand project",
    session_replay_date: new Date().setHours(new Date().getHours() + 2000),
    enable_chatroom_logo: 0,
    moderator_active: 1
  }

  session.createBrandProject(brandProjectAttrs).then(function(result) {
    console.log("brandProject is done!");
    callback(null, user, session, result);
  }).catch(BrandProject.sequelize.ValidationError, function(err) {
    console.log(err);
    callback(err);
  }).catch(function(err) {
    console.log(err);
    callback(err);
  });
};

function addedSessionMember(user, session, brandProject, callback) {
  console.log("added Session Member");
  session.createSessionMember({ role: "owner", userId: user.id, username: "cool user" })
  .then(function (_result) {
    callback(null, user, session, brandProject);
  })
  .catch(function (error) {
    callback(error);
  });
}

function addBrandProjectPreferences(user, session, brandProject, callback) {
  let attrs = {
    sessionId: session.id,
    brand_project_id: brandProject.id
  }

  BrandProjectPreference.create(attrs)
  .then(function (_result) {
    callback(null, user, session, brandProject);
  })
  .catch(function (error) {
    callback(error);
  });
}

function createTopic(user, session, brandProject, callback) {
  session.createTopic({ name: "Cool Topic" })
  .then(function (_result) {
    callback(null, user, session, brandProject);
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
  });
};

createChat();
