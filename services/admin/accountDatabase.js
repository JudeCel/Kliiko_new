'use strict';

var MessagesUtil = require('./../../util/messages');
var mailers = require('../../mailers');
var models = require('./../../models');
var filters = require('./../../models/filters');
var inviteService = require('./../..//services/invite');
var accountUserService = require('./../../services/accountUser');
var ContactListUserService = require('./../..//services/contactListUser');
var {ContactList, User, Account, AccountUser, Subscription} = models;
var constants = require('../../util/constants');
const _ = require('lodash');
var q = require('q');
const Bluebird = require('bluebird');

var validAttributes = [
  'comment',
  'active'
];

function findAllAccounts(callback) {
  Account.findAll({
    attributes: ['id','admin', 'name'],
    where: {admin: false},
    include: accountInclude()
  }).then((accounts) => {
    callback(null, mapData(accounts));
  }, (error) => {
      callback(filters.errors(error));
  });
};


function accountInclude() {
  const accountUserAttrs = constants.safeAccountUserParams.concat('createdAt').concat('role').concat('owner');
  return [{
    model: AccountUser,
    where: { role: { $in: ['accountManager', 'admin'] } },
    order: 'createdAt ASC',
    attributes: accountUserAttrs,
    include: [{ model: User, attributes: ['id'] }]
  },
  { model: Subscription, attributes: ['planId'] }];
}

function mapData(accounts) {
  return accounts.map((account) => {
    let adminUsers = account.AccountUsers.filter((au) => au.role == 'admin' && !au.isRemoved);
    if(_.isEmpty(adminUsers)){
      account.dataValues.hasActiveAdmin = false;
    }else{
      account.dataValues.hasActiveAdmin = true;
    }

    return account
  });
}

function shouldUpdateUser(params, byAccountUser) {
  //is active field being updated
  if (_.indexOf(_.keys(params), "active") > 0) {
    return params.accountUserId != byAccountUser.id;
  }
  return true;
}

function addAdmin({accountId, email}, _accountUserId) {
  return new Bluebird((resolve, reject) => {
    AccountUser.findAll({where: {email: email, role: 'admin'}}).then((accountUsers) => {
      if (_.isEmpty(accountUsers)) {
        reject((MessagesUtil.accountDatabase.adminNotFound  + email));
      } else {
        AccountUser.find({ where: { AccountId: accountId, role: 'admin', email: email,  active: false } }).then((accountUser) => {
          if(accountUser) {
            accountUser.update({ isRemoved: false }).then((updatedAccountUser) => {
              let inviteParams = {
                accountUserId: updatedAccountUser.id,
                accountId: accountId,
                role: accountUsers[0].role
              };

              inviteService.createInvite(inviteParams).then(() => {
                resolve(updatedAccountUser);
              }, (error) => {
                reject(error);
              });
            }, (error) => {
              reject(error);
            });
          }
          else {
            let adminAccountUser = accountUsers[0];
            models.sequelize.transaction().then((transaction) => {
              ContactList.find({where: {accountId: accountId, role: 'accountManager'}, transaction: transaction}).then((contactList) => {
              let contactListUserParams = {
                accountId: accountId,
                contactListId: contactList.id,
                role: adminAccountUser.role,
                defaultFields: {
                  firstName: adminAccountUser.firstName,
                  lastName: adminAccountUser.lastName,
                  email: adminAccountUser.email,
                  gender: adminAccountUser.gender
                }}

                ContactListUserService.create(contactListUserParams, transaction).then((contactListUser) => {
                  let inviteParams = {
                    accountUserId: contactListUser.accountUserId,
                    accountId: accountId,
                    role: adminAccountUser.role
                  }

                  inviteService.createInvite(inviteParams, transaction).then(() => {
                      resolve(adminAccountUser);
                    }, (error) => {
                      transaction.rollback().then(() => reject(error));
                  });
                }, (error) => {
                  transaction.rollback().then(() => reject(error));
                });
              }, (error) => {
                transaction.rollback().then(() => reject(error));
              });
            })
          }
        });
      }
    })
  });
}

function removeAdmin({ accountId }) {
  return new Bluebird((resolve, reject) => {
    AccountUser.find({ where: { AccountId: accountId, role: 'admin' }, include: [{ model: Account, include: [AccountUser] }] }).then((accountUser) => {
      if(!accountUser) return reject('Not found');
      accountUserService.deleteOrRecalculate(accountUser.id, null, 'admin')
        .then(() => Account.find({ where: { id: accountId }, include: accountInclude() }))
        .then((account) => {
          let query = { where: {
            accountUserId: accountUser.id,
            status: 'pending'
            },
            include: [{
              model: models.AccountUser,
              required: true
            }]
          };

          models.Invite.find(query).then((invite) => { 
            if (invite) {
              inviteService.removeInvite(invite).then((message) => {
                resolve(mapData([account])[0]);
              }, (error) => {
                reject(error);
              });
            } else {
              resolve(mapData([account])[0]);
            }  
          });
        }).catch((error) => reject(error));
    });
  });
}

function updateAccountUserComment(params) {
  let deferred = q.defer();

  AccountUser.find({ where: { id: params.id } }).then(function(accountUser) {
    if(accountUser) {
      accountUser.update({ comment: params.comment }).then(function() {
        accountUser.getAccount({ include: [{ model: User, attributes: userAttributes() }, AccountUser, models.Subscription ] }).then(function(account) {
          deferred.resolve(account);
        });
      }, function(error) {
        deferred.reject(filters.errors(error));
      });
    }
    else {
      deferred.reject(MessagesUtil.accountDatabase.notFound);
    }
  });

  return deferred.promise;
}

function updateAccountUser(params, byAccountUser, callback) {
  byAccountUser = byAccountUser || {};
  let updateParams = validateParams(params);

  if (shouldUpdateUser(params, byAccountUser)) {
    if (params.userId) {
      AccountUser.update(updateParams, {
        where: {
          AccountId: params.accountId
        },
        returning: true
      }).then(function(result) {
        if(result[0] == 0) {
          callback(MessagesUtil.accountDatabase.notFound);
        }
        else {
          let accountUser = result[1][0];
          accountUser.getAccount({ include: [{ model: User, attributes: userAttributes() }, AccountUser, models.Subscription ] }).then(function(account) {
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
      callback(MessagesUtil.accountDatabase.notVerified);
    }
  } else {
    callback(MessagesUtil.accountDatabase.selfDisable);
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
  updateAccountUserComment: updateAccountUserComment,
  csvData: csvData,
  csvHeader: csvHeader,
  addAdmin: addAdmin,
  removeAdmin: removeAdmin
};
