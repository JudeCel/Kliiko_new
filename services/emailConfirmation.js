'use strict';

var MessagesUtil = require('./../util/messages');
var usersService = require('./users');
var async = require('async');
var models = require('./../models');
var User = require('./../models').User;
var AccountUser = require('./../models').AccountUser;
var uuid = require('node-uuid');
var mailers = require('../mailers');

function sendEmailConfirmationToken(email, callback) {
  async.waterfall([
    function (next) {
      setEmailConfirmationToken(email, next);
    },
    function (token, next) {
      if (token) {
        let params = {
          token: token,
          email: email
        };
        mailers.users.sendEmailConfirmationToken(params, next);
      } else {
        return next(new Error(MessagesUtil.emailConfirmation.error.token));
      }
    }
  ], callback);
}

function sendEmailAccountConfirmationToken(email, accountUserId, callback) {
  async.waterfall([
    function (next) {
      setEmailConfirmationToken(email, next);
    },
    function (token, next) {
      if (token) {
        let params = {
          token: token,
          email: email,
          accountUserId: accountUserId
        };
        mailers.users.sendEmailConfirmationToken(params, next);
      } else {
        return next(new Error(MessagesUtil.emailConfirmation.error.token));
      }
    }
  ], callback);
}

function getUserByToken(token, callback) {
  User.find({
    where: {
      confirmationToken: token
    },
    attributes: ['id', 'confirmedAt', 'email', 'confirmationToken']
  }).then(function (result) {
    callback(null, result);
  }).catch(function (err) {
    callback(err);
  });
}

function setEmailConfirmationToken(email, callback) {
  let token = uuid.v1();
  User.update({
    confirmationToken: token,
    confirmationSentAt: new Date()
  }, {
    where: {email: { ilike: email } }
  }).then(function (result) {
    if (result[0] > 0) {
      callback(null, token);
    } else {
      callback(null, null);
    }
  }).catch(function (err) {
    callback(true, null);
  });
}

function checkTokenExpired(token, callback) {
  getUserByToken(token, function (err, user) {
    if (err || !user) { return callback(new Error(MessagesUtil.emailConfirmation.error.user)) };

    let tokenCreated = new Date(user.get("confirmationToken"));
    let tokenEnd = tokenCreated.setHours(tokenCreated.getHours() + 24);
    let now = new Date().getTime();
    if (now > tokenEnd) { user = null };
    callback(null, user);
  });
}

function confirm(token, accountUserId, callback) {
  getUserByToken(token, function (err, user) {
    if (err || !user) { return callback(new Error(MessagesUtil.emailConfirmation.error.user)) };

    models.sequelize.transaction().then(function(transaction) {

      User.update({
        confirmedAt: new Date(),
        confirmationToken: null
      }, {
        where: { confirmationToken: token },
        transaction: transaction
      }).then(function (result) {

        if (accountUserId) {
          AccountUser.update({
            active: true
          }, {
            where: { UserId: user.id, id: accountUserId },
            transaction: transaction
          }).then(function (accountUserResult) {
            transaction.commit().then(function() {
              callback(null, result);
            });
          }).catch(function (err) {
            transaction.rollback().then(function() {
              callback(err);
            });
          });
        } else {
          transaction.commit().then(function() {
            callback(null, result);
          });
        }

      }).catch(function (err) {
        transaction.rollback().then(function() {
          callback(err);
        });
      });

    });

  });
}

function getEmailConfirmationByToken(user, accountUserId, callback) {
  confirm(user.confirmationToken, accountUserId, function (err, data) {
    if (err) { return callback(err) };
    callback(null, user);
  });
}

module.exports = {
  sendEmailConfirmationToken: sendEmailConfirmationToken,
  getEmailConfirmationByToken: getEmailConfirmationByToken,
  checkTokenExpired: checkTokenExpired,
  sendEmailAccountConfirmationToken
}
