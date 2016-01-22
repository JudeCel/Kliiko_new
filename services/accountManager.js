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
function createOrFindAccountUser(req, res, callback) {
  let user = req.user;
  let params = prepareParams(req);
  let currentDomain = res.locals.currentDomain;

  preValidate(user, currentDomain.id, params, function(error) {
    if(error) {
      return callback(error);
    }

    User.find({
      where: { email: params.email }
    }).then(function(user) {
      if(user) {
        user.getAccounts({where: {id: currentDomain.id}}).then(function (results) {
          if (_.isEmpty(results)) {
            createAccountUser(params, user.id, "existing", currentDomain.id, callback);
          }else{
            callback('This account has already accepted invite.');
          }
        })
      } else {
        User.create(userParams(params.email)).then(function(user) {
          createAccountUser(params, user.id, "new", currentDomain.id, callback);
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
      callback(null, results)
  })
  // async.parallel([
  //   function(cb) {
  //     findUsers(User, { owner: false, AccountId: currentDomainId}, [ 'id', 'UserId', 'AccountId' ], cb);
  //   },
  //   function(cb) {
  //     findUsers(Invite, { AccountId: currentDomainId, role: 'accountManager' }, [ 'id', 'UserId' ], cb);
  //   }
  // ], function(err, results) {
  //   if(err) {
  //     callback(err);
  //   }
  //   else {
  //     callback(null, _.union(results[0], results[1]));
  //   }
  // });
};

function findAndRemoveAccountUser(userId, accountId, callback) {
  // AccountUser.findAll().then(function (r) {
  //   console.log(userId);
  //   console.log(accountId);
  //   console.log(r);
  // })
  AccountUser.find({
    where: {
      UserId: userId,
      AccountId: accountId,
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
    console.log(error);
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
  createOrFindAccountUser: createOrFindAccountUser,
  findAccountManagers: findAccountManagers,
  findAndRemoveAccountUser: findAndRemoveAccountUser
};
