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
function createOrFindAccountManager(req, res, callback) {
  let user = req.user;
  let params = prepareParams(req);
  let currentDomain = res.locals.currentDomain;

  preValidate(user, currentDomain.id, params, function(error) {
    if(error) {
      return callback(error);
    }

    User.find({
      where: { email: params.email }
    }).then(function(existsUser) {
      if(existsUser) {
        existsUser.getAccounts({ where: {id: currentDomain.id } }).then(function (results) {
          if (_.isEmpty(results)) {
            createAccountUser(params, existsUser.id, "existing", currentDomain.id, callback);
          }else{
            callback('This account has already accepted invite.');
          }
        })
      } else {
        User.create(userParams(params.email)).then(function(newUser) {
          createAccountUser(params, newUser.id, "new", currentDomain.id, callback);
        }, function(err) {
          callback(prepareErrors(err));
        });
      }
    });
  });
};

function createAccountUser(params, userId, type, accountId, cb) {
  adjustParamsForNewAccountUser(params, userId, accountId);
  AccountUser.create(params).then(function(newAccountUser){
    cb(null, inviteParams(newAccountUser.id, accountId, userId, type));
  }).catch(function(error) {
    cb(prepareErrors(error));
  });
}

function userParams(email) {
  return {email: email, password: crypto.randomBytes(16).toString('hex')};
}

function findAccountManagers(currentDomainId, callback) {
  AccountUser.findAll({where: {AccountId:  currentDomainId,
    role: 'accountManager'}}).then(function(results) {
      callback(null, results);
  })
};

function findAndRemoveAccountUser(id, callback) {
  AccountUser.find({
    where: {
      id: id,
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
function preValidate(user, currentDomainId, params, callback) {
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
      AccountId: currentDomainId
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

function adjustParamsForNewAccountUser(params, userId, accountId) {
  params.state = "invited";
  params.role = 'accountManager';
  params.AccountId = accountId;
  params.UserId = userId;
  return params;
}

// return all Account managers invaited and accepted
function findUsers(model, where, attributes, cb) {
  AccountUser.findAll({
    where: where,
    include: [{
      model: model
    }],
    attributes: attributes
  }).then(function(accountUser) {
    cb(null, accountUser);
  }).catch(function(error) {
    cb(prepareErrors(error));
  });
}

function inviteParams(accountUserId, accountId, userId, type) {
  return { userId: userId, accountUserId: accountUserId, accountId: accountId, userType: type, role: 'accountManager' };
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
  createOrFindAccountManager: createOrFindAccountManager,
  findAccountManagers: findAccountManagers,
  findAndRemoveAccountUser: findAndRemoveAccountUser
};
