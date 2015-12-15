'use strict';

var models = require('./../models');
var AccountUser = models.AccountUser;
var User = models.User;
var Account = models.Account;
var Invite = models.Invite;

var userService = require('./../services/users');
var inviteService = require('./../services/invite');

var async = require('async');
var _ = require('lodash');
var crypto = require('crypto');

//Exports
function createOrFindUser(req, callback) {
  let user = req.user,
      params = prepareParams(req);

  preValidate(user, params, function(error) {
    if(error) {
      return callback(error);
    }

    User.find({
      include: [ Account ],
      where: { email: params.email }
    }).then(function(foundUser) {
      if(foundUser) {
        callback(null, inviteParams(foundUser.id, user.accountOwnerId, 'existing'));
      }
      else {
        adjustParamsForNewUser(params);
        userService.create(params, function(error, newUser) {
          callback(error, inviteParams(newUser.id, user.accountOwnerId, 'new'));
        });
      }
    });
  });
};

function findAccountManagers(user, callback) {
  async.parallel([
    function(cb) {
      findUsers(user.id, Account, { id: user.accountOwnerId }, cb);
    },
    function(cb) {
      findUsers(user.id, Invite, { accountId: user.accountOwnerId, role: 'accountManager' }, cb);
    }
  ], function(err, results) {
    if(err) {
      callback(err);
    }
    else {
      callback(null, _.union(results[0], results[1]));
    }
  });
};

function removeInviteOrAccountUser(req, callback) {
  let currentUser = req.user,
      userId = req.params.id,
      type = req.params.type;

  switch(type) {
    case 'invite': {
      Invite.find({
        where: {
          userId: userId,
          accountId: currentUser.accountOwnerId
        }
      }).then(function(invite) {
        inviteService.removeInvite(invite, function(err) {
          callback(err, 'Successfully removed Invite');
        });
      });
      break;
    }
    case 'account': {
      AccountUser.find({
        where: {
          UserId: userId,
          AccountId: currentUser.accountOwnerId
        }
      }).then(function(result) {
        if(result) {
          result.destroy().then(function() {
            callback(null, 'Successfully removed account from Account List');
          });
        }
        else {
          callback('Account not found or your are not owner');
        }
      });
      break;
    }
  }
};

//Helpers
function preValidate(user, params, callback) {
  if(user.email == params.email) {
    return callback({ email: 'You are trying to invite yourself.' });
  }

  AccountUser.findAll({
    include: [{
      model: User,
      where: { email: params.email }
    }],
    where: { AccountId: user.accountOwnerId }
  }).then(function(accountUsers) {
    if(_.isEmpty(accountUsers)) {
      callback(null, true);
    }
    else {
      callback({ email: 'This account has already accepted invite.' });
    }
  }).catch(function(err) {
    callback(err);
  });
};

function adjustParamsForNewUser(params) {
  params.password = crypto.randomBytes(16).toString('hex');
  params.accountName = crypto.randomBytes(16).toString('hex');
  params.status = 'invited';
  params.confirmedAt = new Date();
  return params;
}

function findUsers(userId, model, where, cb) {
  User.findAll({
    include: [{
      model: model,
      where: where
    }],
    where: { id: { $ne: userId } }
  }).then(function(users) {
    cb(null, users);
  }).catch(function(err) {
    cb(err);
  });
}

function inviteParams(invitedUserId, accountId, type) {
  return { userId: invitedUserId, accountId: accountId, userType: type, role: 'accountManager' };
};

function prepareParams(req) {
  return _.pick(req.body, ['firstName', 'lastName', 'gender', 'email', 'mobile', 'postalAddress', 'city', 'postCode', 'companyName', 'landlineNumber']);
};

module.exports = {
  createOrFindUser: createOrFindUser,
  findAccountManagers: findAccountManagers,
  removeInviteOrAccountUser: removeInviteOrAccountUser
};
