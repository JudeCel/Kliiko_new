"use strict";
var usersService = require('./users');
var async = require('async');
var User = require('./../models').User;
var uuid = require('node-uuid');
var mailers = require('../mailers');

function sendEmailConfirmationToken(email, callback) {
  async.waterfall([
    function (next) {
      setEmailConfirmationToken(email, next);
    },
    function (token, next) {
      if (!token) {
        return next(new Error('Failed create token'));
      }
      let params = {
        token: token,
        email: email
      };
      mailers.users.sendEmailConfirmationToken(params, next);
    }
  ], callback);
}

function getUserByToken(token, callback) {
  User.find({
    where: {
      confirmationToken: token
    },
    attributes: ['id', 'confirmedAt', 'email', 'confirmationToken']
  })
    .then(function (result) {
      callback(null, result);
    })
    .catch(function (err) {
      callback(err);
    });
}

function setEmailConfirmationToken(email, callback) {

  let token = uuid.v1();

  User.update({
    confirmationToken: token,
    confirmationSentAt: new Date()
  }, {
    where: {email: email}
  })
    .then(function (result) {
      if (result[0] > 0) {
        callback(null, token);
      } else {
        callback(null, null);
      }
    })
    .catch(function (err) {
      callback(true, null);
    });
}

function checkTokenExpired(token, callback) {
  getUserByToken(token, function (err, user) {
    if (err || !user) { return callback(new Error('User not found')) };

    let tokenCreated = new Date(user.get("confirmationToken"));
    let tokenEnd = tokenCreated.setHours(tokenCreated.getHours() + 24);
    let now = new Date().getTime();
    if (now > tokenEnd) { user = null };
    callback(null, user);
  });
}

function confirm(token, callback) {
  User.update({
    confirmedAt: new Date(),
    confirmationToken: null
  }, {
    where: {confirmationToken: token}
  })
    .then(function (result) {
      return callback(null, result);
    })
    .catch(function (err) {
      callback(err);
  });
}

function getEmailConfirmationByToken(user, callback) {
  confirm(user.confirmationToken, function (err, data) {
    if (err) { return callback(err) };
    callback(null, user);
  });
}

module.exports = {
  sendEmailConfirmationToken: sendEmailConfirmationToken,
  getEmailConfirmationByToken: getEmailConfirmationByToken,
  checkTokenExpired: checkTokenExpired
}
