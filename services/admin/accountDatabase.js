'use strict';
var mailers = require('../../mailers');
var models = require('./../../models');
var filters = require('./../../models/filters');
var Account = models.Account;
var User = models.User;
var AccountUser = models.AccountUser;
var constants = require('../../util/constants');
var _ = require('lodash');
var q = require('q');

var validAttributes = [
  'comment',
  'active'
];

function findAllAccounts(callback) {
  Account.findAll({
    include: [{ model: AccountUser, include: [ { model: User } ] }, {model: models.Subscription} ]
  }).then(function(accounts) {
    callback(null, accounts);
  }, function(error) {
      callback(filters.errors(error));
  });
};

function shouldUpdateUser(params, byUser) {
  //is active field being updated
  if (_.indexOf(_.keys(params), "active") > 0) {
    return !(params.userId == byUser.accountUserId);
  }
  return true;
}

function updateAccountUser(params, byUser, callback) {
  byUser = byUser || {};
  let updateParams = validateParams(params);

  if (shouldUpdateUser(params, byUser)) {
    if (params.userId) {
      AccountUser.update(updateParams, {
        where: {
          UserId: params.userId,
          AccountId: params.accountId
        },
        returning: true
      }).then(function(result) {
        if(result[0] == 0) {
          callback('There is no AccountUser with userId: ' + params.userId + ' and accountId: ' + params.accountId);
        }
        else {
          let accountUser = result[1][0];
          accountUser.getAccount({ include: [{ model: User, attributes: userAttributes() }, AccountUser ] }).then(function(account) {
            if(params.hasOwnProperty('active')) {
              accountUser.getUser().then(function(user) {
                mailers.users.sendReactivateOrDeactivate({ email: user.email, name: account.name, active: accountUser.active, firstName: accountUser.firstName, lastName: accountUser.lastName });
              });
            }
            callback(null, account);
          });
        }
      }).catch(function(error) {
        callback(filters.errors(error));
      });
    } else {
      callback('Account is not verified');
    }
  } else {
    callback('Cannot disable your account');
  }
};

function csvData() {
  let deferred = q.defer();
  findAllAccounts(function(error, accounts) {
    if(error) {
      deferred.reject(error);
    }else {
      deferred.resolve(buldDataList(accounts));
    }
  });
  return deferred.promise;
};

function buldDataList(accounts) {
  let data = [];
  _.forEach(accounts, function(account) {
    _.forEach(account.AccountUsers, function(accountUser) {
      data.push(buldCSVRow(account, accountUser));
    });
  });
  return data;
}

function buldCSVRow(account, accountUser) {

  return {
    'Account Name': account.name || '',
    'Account Manager': accountUser.firstName + ' ' + accountUser.lastName || '',
    'Registered': accountUser.createdAt || '',
    'E-mail': accountUser.email || '',
    'Address': accountUser.postalAddress || '',
    'City': accountUser.city || '',
    'Postcode': accountUser.postCode || '',
    'Country': accountUser.country || '',
    'Company': accountUser.companyName || '',
    'Gender': accountUser.gender || '',
    'Mobile': accountUser.mobile || '',
    'Landline': accountUser.landlineNumber || '',
    'Sessions Purchased': '',
    'Tips Permission': '',
    'Active Sessions': '',
    'Comment': accountUser.comment || ''
  };
}

function csvHeader() {
  return [
    'Account Name',
    'Account Manager',
    'Registered',
    'E-mail',
    'Address',
    'City',
    'Postcode',
    'Country',
    'Company',
    'Gender',
    'Mobile',
    'Landline',
    'Sessions Purchased',
    'Tips Permission',
    'Active Sessions',
    'Comment'
  ];
};

function findAccountUser(account, userId) {
  return _.find(account.AccountUsers, function(accountUser) {
    return accountUser.UserId == userId;
  });
};

function userAttributes() {
  let attributes = constants.safeUserParams;
  attributes.push('createdAt');
  return attributes;
}

function validateParams(params, attrs) {
  return _.pick(params, attrs || validAttributes);
};

module.exports = {
  findAllAccounts: findAllAccounts,
  updateAccountUser: updateAccountUser,
  csvData: csvData,
  csvHeader: csvHeader
};
