'use strict';

var models = require('./../models');
var AccountUser = models.AccountUser;
var User = models.User;
var Account = models.Account;
var Invite = models.Invite;

var inviteService = require('./../services/invite');
var constants = require('../util/constants');

var async = require('async');
var _ = require('lodash');
var crypto = require('crypto');

//Exports
function createOrFindUser(req, res, callback) {
  let user = req.user;
  let params = prepareParams(req);
  let currentDomain = res.locals.currentDomain;

  preValidate(user, currentDomain, params, function(error) {
    if(error) {
      return callback(error);
    }

    User.find({
      include: [ Account ],
      where: { email: params.email }
    }).then(function(foundUser) {
      if(foundUser) {
        callback(null, inviteParams(foundUser.id, user.ownerAccountId, 'existing'));
      }
      else {
        adjustParamsForNewUser(params);
        User.create(params).then(function(newUser) {
          callback(null, inviteParams(newUser.id, user.ownerAccountId, 'new'));
        }).catch(function(error) {
          callback(prepareErrors(error));
        });
      }
    });
  });
};

function findAccountManagers(currentDomain, currentDomain, callback) {
  async.parallel([
    function(cb) {
      findUsers(AccountUser, { owner: false, AccountId: currentDomain.id }, [ 'id', 'UserId', 'AccountId' ], cb);
    },
    function(cb) {
      findUsers(Invite, { accountId: currentDomain.id, role: 'accountManager' }, [ 'id', 'userId' ], cb);
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

function findAndRemoveAccountUser(req, callback) {
  let currentUser = req.user,
      userId = req.query.id;

  AccountUser.find({
    where: {
      UserId: userId,
      AccountId: currentUser.ownerAccountId,
      owner: false
    }
  }).then(function(result) {
    if(result) {
      result.destroy().then(function() {
        callback(null, 'Successfully removed account from Account List');
      });
    }
    else {
      callback('Account not found or you are not an owner');
    }
  });
};

//Helpers
function preValidate(user, currentDomain, params, callback) {
  if(user.email == params.email) {
    return callback({ email: 'You are trying to invite yourself.' });
  }

  AccountUser.findAll({
    include: [{
      model: User,
      where: { email: params.email }
    }],
    where: {
      UserId: { $ne: user.id },
      AccountId: currentDomain.id
    }
  }).then(function(accountUsers) {
    if(_.isEmpty(accountUsers)) {
      callback(null, true);
    }
    else {
      callback({ email: 'This account has already accepted invite.' });
    }
  }).catch(function(error) {
    callback(prepareErrors(error));
  });
};

function adjustParamsForNewUser(params) {
  params.password = crypto.randomBytes(16).toString('hex');
  params.confirmedAt = new Date();
  return params;
}

function findUsers(model, where, attributes, cb) {
  User.findAll({
    include: [{
      model: model,
      where: where,
      attributes: attributes
    }],
    attributes: constants.safeUserParams
  }).then(function(users) {
    cb(null, users);
  }).catch(function(error) {
    cb(prepareErrors(error));
  });
}

function inviteParams(invitedUserId, accountId, type) {
  return { userId: invitedUserId, accountId: accountId, userType: type, role: 'accountManager' };
};

function prepareParams(req) {
  return _.pick(req.body, ['firstName', 'lastName', 'gender', 'email', 'mobile', 'postalAddress', 'city', 'state', 'postcode', 'companyName', 'landlineNumber']);
};

function prepareErrors(err) {
  let errors = ({});
  _.map(err.errors, function (n) {
    let message = n.message.replace(n.path, '');
    if(message == " cannot be null") {
      message = " cannot be empty";
    }
    errors[n.path] = _.startCase(n.path) + ':' + message;
  });
  return errors;
};

module.exports = {
  createOrFindUser: createOrFindUser,
  findAccountManagers: findAccountManagers,
  findAndRemoveAccountUser: findAndRemoveAccountUser
};
