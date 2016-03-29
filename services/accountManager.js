'use strict';

var models = require('./../models');
var filters = require('./../models/filters');
var AccountUser = models.AccountUser;
var User = models.User;
var Account = models.Account;

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
        }, function(error) {
          callback(filters.errors(error));
        });
      }
    });
  });
};

function createAccountUser(params, userId, type, accountId, cb) {
  adjustParamsForNewAccountUser(params, userId, accountId);
  AccountUser.create(params).then(function(newAccountUser){
    addToContactList(newAccountUser, function(error) {
      if (error) {
        cb(filters.errors(error));
      }else {
        cb(null, inviteParams(newAccountUser.id, accountId, userId, type));
      }
    })
  }).catch(function(error) {
    cb(filters.errors(error));
  });
}

function addToContactList(accountUser, callback) {
  models.ContactList.find({
    where: {
      role: accountUser.role,
      accountId: accountUser.AccountId
    }
  }).then(function(contactList) {
    let params = {
      userId: accountUser.UserId,
      accountUserId: accountUser.id,
      accountId: accountUser.AccountId,
      contactListId: contactList.id
    }
    models.ContactListUser.create(params).then(function() {
      callback(null);
    },function(err) {
      callback(err);
    })
  })
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
      callback({ email: 'This user is already invited.' });
    }
  }).catch(function(error) {
    callback(filters.errors(error));
  });
};

function adjustParamsForNewAccountUser(params, userId, accountId) {
  params.status = "invited";
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
    cb(filters.errors(error));
  });
}

function inviteParams(accountUserId, accountId, userId, type) {
  return { userId: userId, accountUserId: accountUserId, accountId: accountId, userType: type, role: 'accountManager' };
};

function prepareParams(req) {
  return _.pick(req.body, ['firstName', 'lastName', 'gender', 'email', 'mobile', 'postalAddress', 'city', 'state', 'postCode', 'companyName', 'landlineNumber']);
};

module.exports = {
  createOrFindAccountManager: createOrFindAccountManager,
  findAccountManagers: findAccountManagers,
  findAndRemoveAccountUser: findAndRemoveAccountUser
};
