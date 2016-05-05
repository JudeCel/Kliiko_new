'use strict';

var models = require('./../models');
var filters = require('./../models/filters');
var AccountUser = models.AccountUser;
var User = models.User;
var Account = models.Account;

var async = require('async');
var _ = require('lodash');
var crypto = require('crypto');
var q = require('q');

//Exports
function createOrFindAccountManager(user, body, accountId) {
  let deferred = q.defer();
  let params = prepareParams(body);

  preValidate(user, accountId, params.email).then(function() {
    return User.find({ where: { email: params.email } });
  }).then(function(existsUser) {
    if(existsUser) {
      return inviteExistingUser(existsUser, params, accountId);
    }
    else {
      return inviteNewUser(params, accountId);
    }
  }).then(function(params) {
    deferred.resolve(params);
  }).catch(function(error) {
    console.error(error);
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
};

function inviteNewUser(params, accountId) {
  let deferred = q.defer();

  createAccountUser(params, null, 'new', accountId).then(function(data) {
    User.create(userParams(params.email)).then(function(newUser) {
      AccountUser.update({ UserId: newUser.id }, { where: { id: data.accountUserId } }).then(function() {
        data.userId = newUser.id;
        deferred.resolve(data);
      }, function(error) {
        deferred.reject(filters.errors(error));
      });
    }, function(error) {
      deferred.reject(filters.errors(error));
    });
  }, function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function inviteExistingUser(existsUser, params, accountId) {
  let deferred = q.defer();

  existsUser.getAccounts({ where: { id: accountId } }).then(function(results) {
    if(_.isEmpty(results)) {
      createAccountUser(params, existsUser.id, 'existing', accountId).then(function(params) {
        deferred.resolve(params);
      }, function(error) {
        deferred.reject(filters.errors(error));
      });
    }
    else {
      deferred.reject('This account has already accepted invite.');
    }
  });

  return deferred.promise;
}

function updateAccountManager(data) {
  let deferred = q.defer();

  let params = {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    gender: data.gender,
    mobile: data.mobile,
    phoneCountryData: data.phoneCountryData,
    country: data.country,
    postalAddress: data.postalAddress,
    city: data.city,
    state: data.state,
    postCode: data.postCode,
    companyName: data.companyName,
    landlineNumber: data.landlineNumber,
    landlineNumberCountryData: data.landlineNumberCountryData
  };

  AccountUser.update(params, { where: { id: data.id }, returning: true }).then(function(au) {
    AccountUser.find({
      where :{
        id: data.id
      }
    }).then(function(accountManager) {
      deferred.resolve({message: "Account manager was successfully updated.", accountManager: accountManager});
    }).catch(function(error) {
      deferred.reject(filters.errors(error));
    });
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function createAccountUser(params, userId, type, accountId, cb) {
  let deferred = q.defer();
  adjustParamsForNewAccountUser(params, userId, accountId);

  AccountUser.create(params).then(function(newAccountUser){
    addToContactList(newAccountUser).then(function() {
      deferred.resolve(inviteParams(newAccountUser.id, accountId, userId, type));
    }, function(error) {
      deferred.reject(filters.errors(error));
    });
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function addToContactList(accountUser, callback) {
  let deferred = q.defer();

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
    };

    models.ContactListUser.create(params).then(function() {
      deferred.resolve();
    },function(error) {
      deferred.reject(filters.errors(error));
    });
  });

  return deferred.promise;
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
function preValidate(user, accountId, email) {
  let deferred = q.defer();

  if(user.email == email) {
    deferred.reject({ email: 'You are trying to invite yourself.' });
  }
  else {
    AccountUser.findAll({
      include: [{
        model: User,
        where: { email: email }
      }],
      where: {
        UserId: { $ne: user.id },
        AccountId: accountId
      }
    }).then(function(accountUsers) {
      if(_.isEmpty(accountUsers)) {
        deferred.resolve();
      }
      else {
        deferred.reject({ email: 'This user is already invited.' });
      }
    }).catch(function(error) {
      deferred.reject(filters.errors(error));
    });
  }

  return deferred.promise;
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

function prepareParams(body) {
  return _.pick(body, ['firstName', 'lastName', 'gender', 'email', 'mobile', 'phoneCountryData', 'country', 'postalAddress', 'city', 'state', 'postCode', 'companyName', 'landlineNumber', 'landlineNumberCountryData']);
};

module.exports = {
  createOrFindAccountManager: createOrFindAccountManager,
  findAccountManagers: findAccountManagers,
  findAndRemoveAccountUser: findAndRemoveAccountUser,
  updateAccountManager: updateAccountManager
};
