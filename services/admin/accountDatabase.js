'use strict';
var mailers = require('../../mailers');
var Account = require('./../../models').Account;
var User = require('./../../models').User;
var AccountUser = require('./../../models').AccountUser;
var constants = require('../../util/constants');
var _ = require('lodash');

var validAttributes = [
  'comment',
  'active'
];

function findAllAccounts(callback) {
  Account.findAll({
    include: [{ model: User, attributes: userAttributes() }, AccountUser]
  }).then(function(accounts) {
    callback(null, accounts);
  }).catch(function(error) {
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
            mailers.users.sendReactivateOrDeactivate({ email: user.email, name: account.name, active: accountUser.active });
          });
        }
        callback(null, account);
      });
    }
  }).catch(function(error) {
    callback(prepareErrors(error));
  });
};

function csvData(callback) {
  findAllAccounts(function(error, accounts) {
    if(error) {
      callback(error);
    }
    else {
      let data = [];
      for(let accId in accounts) {
        let account = accounts[accId];
        for(let useId in account.Users) {
          let user = account.Users[useId];
          data.push({
            'Account Name': account.name || '',
            'Account Manager': user.firstName + ' ' + user.lastName || '',
            'Registered': user.createdAt || '',
            'E-mail': user.email || '',
            'Address': user.postalAddress || '',
            'City': user.city || '',
            'Postcode': user.postCode || '',
            'Country': user.country || '',
            'Company': user.companyName || '',
            'Gender': user.gender || '',
            'Mobile': user.mobile || '',
            'Landline': user.landlineNumber || '',
            'Sessions purchased': '',
            'Type permission': '',
            'Active Sessions': '',
            'Comment': findAccountUser(account, user).comment || ''
          });
        };
      };
      callback(null, data);
    }
  });
};

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

function findAccountUser(account, user) {
  for(let auId in account.AccountUsers) {
    let accountUser = account.AccountUsers[auId];
    if(accountUser.UserId == user.id) {
      return accountUser;
    }
  }

  return {};
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
