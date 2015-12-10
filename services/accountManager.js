'use strict';

var models = require('./../models');
var AccountUser = models.AccountUser;
var User = models.User;
var Account = models.Account;
var Invite = models.Invite;
var userService = require('./../services/users');
var inviteService = require('./../services/invite');
var accountUserService = require('./../services/accountUser');
var async = require('async');
var _ = require('lodash');
var crypto = require('crypto');

//Exports
function findAccountManagers(user, callback) {
  async.parallel([
    function(cb) {
      User.findAll({
        include: [{
          model: Account,
          where: { id: user.accountOwnerId }
        }],
        where: { id: { $ne: user.id } }
      }).then(function(users) {
        cb(null, users);
      }).catch(function(err) {
        cb(err);
      });
    },
    function(cb) {
      User.findAll({
        include: [{
          model: Invite,
          where: { accountId: user.accountOwnerId, role: 'accountManager' }
        }],
        where: { id: { $ne: user.id } }
      }).then(function(users) {
        cb(null, users);
      }).catch(function(err) {
        cb(err);
      });
    }
  ], function(err, results) {
    if(err) {
      callback(err);
    }
    else {
      callback(null, _.union(results[0], results[1]));
    }
  });
}

function createOrFindUser(req, callback) {
  let user = req.user,
      params = prepareParams(req);

  User.find({
    include: [ Account ],
    where: { email: params.email }
  }).done(function(foundUser) {
    if(foundUser) {
      callback(null, inviteParams(false, foundUser.id, user.accountOwnerId, 'existing'));
    }
    else {
      let token = crypto.randomBytes(16).toString('hex');
      params.password = token;
      params.accountName = token;
      params.status = 'invited';
      params.confirmedAt = new Date();

      userService.create(params, function(error, newUser) {
        if(error) {
          callback(error);
        }
        else {
          callback(null, inviteParams(true, newUser.id, user.accountOwnerId, 'new'));
        }
      });
    }
  });
}

function removeInviteOrAccountUser(req, callback) {
  let currentUser = req.user,
      userId = req.params.id,
      type = req.params.type;

  if(type == 'invite') {
    Invite.find({
      where: {
        userId: userId,
        accountId: currentUser.accountOwnerId
      }
    }).done(function(invite) {
      inviteService.removeInvite(invite, function(err) {
        if(err){
          callback(err);
        }
        else {
          callback(null, 'Successfully removed Invite');
        }
      });
    });
  }
  else if(type == 'account') {
    AccountUser.find({
      where: {
        UserId: userId,
        AccountId: currentUser.accountOwnerId
      }
    }).done(function(result) {
      if(result) {
        result.destroy().done(function() {
          callback(null, 'Successfully removed account from Account List');
        });
      }
      else {
        callback('Account not found or your are not owner');
      }
    });
  }
}

function simpleParams(error, message, account) {
  return { title: 'Manage Account Managers', error: error || {}, message: message, account: account };
}

//Helpers
function inviteParams(created, invitedUserId, accountId, type) {
  return { created: created, userId: invitedUserId, accountId: accountId, userType: type, role: 'accountManager' }
}

function prepareParams(req, errors) {
  return _.pick(req.body, ['firstName', 'lastName', 'gender', 'email', 'mobile', 'postalAddress', 'city', 'postCode', 'companyName', 'landlineNumber']);
}

module.exports = {
  findAccountManagers: findAccountManagers,
  createOrFindUser: createOrFindUser,
  removeInviteOrAccountUser: removeInviteOrAccountUser,
  simpleParams: simpleParams
}
