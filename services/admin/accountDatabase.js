'use strict';
var mailers = require('../../mailers');
var models = require('./../../models');
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
    include: [{ model: AccountUser, include: [ { model: User } ] } ]
  }).then(function(accounts) {
    callback(null, accounts);
  }, function(error) {
      callback(prepareErrors(error));
  });
};

function updateAccountUser(params, callback) {
  AccountUser.update(validateParams(params), {
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
    callback(prepareErrors(error));
  });
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
    'Sessions purchased': '',
    'Type permission': '',
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
    'Sessions purchased',
    'Type permission',
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

function prepareErrors(err) {
  let errors = ({});
  _.map(err.errors, function (n) {
    errors[n.path] = _.startCase(n.path) + ":" + n.message.replace(n.path, '');
  });
  return errors;
};

module.exports = {
  findAllAccounts: findAllAccounts,
  updateAccountUser: updateAccountUser,
  csvData: csvData,
  csvHeader: csvHeader
};
