'use strict';

var MessagesUtil = require('./../util/messages');
var constants = require('./../util/constants');
var models = require('./../models');
var filters = require('./../models/filters');
var emailConfirmation = require('./emailConfirmation');
var AccountUser = models.AccountUser;
var SessionMember = models.SessionMember;
var User = models.User;
var _ = require('lodash');
var q = require('q');
var Bluebird = require('bluebird');
var sessionMemberService = require('./sessionMember');

const VALID_ATTRIBUTES = {
  accountUser: [
    'id',
    'role'
  ],
  sessionMember: [
    'id',
    'role',
    'sessionId'
  ]
};

function deleteOrRecalculate(id, addRole, removeRole, transaction) {
  return new Bluebird((resolve, reject) => {
    // can't remove owner account user!
    let query = {
      where: {
        id: id
      },
      transaction: transaction,
      include: [
        { model: models.Account},
        { model: SessionMember }
      ]
    }

    AccountUser.find(query).then((accountUser) => {
      if (accountUser) {
        recalculateRole(accountUser, addRole, removeRole).then((params) => {
          accountUser.update(params, {transaction: transaction}).then((updatedAccountUser) => {
            resolve(updatedAccountUser);
          }, (error) => {
            reject(error);
          });
        }, (error) => {
          reject(error);
        });
      }else{
        reject(MessagesUtil.accountUser.notFound);
      }
    });
  })
}

function recalculateRole(accountUser, newRole, removeRole) {
  return new Bluebird((resolve, reject) => {
    const roles = ['admin', 'accountManager', 'facilitator', 'participant', 'observer'] // order is important!
    if (newRole && removeRole) {
      reject("Can do only add or remove at one time");
    }

    if (newRole || removeRole) {
      if (!_.includes(roles, (newRole || removeRole))) {
        reject(`This role not valid: ${(newRole || removeRole)}`);
      }
    }

    const currentRole = accountUser.role;

    let  relatedRoles = _.uniq((accountUser.SessionMembers || []).map((sm) => { return sm.role }));

    if (removeRole && roles.indexOf(currentRole) < roles.indexOf(removeRole)) {
      relatedRoles.push(currentRole);
    }

    if (newRole && roles.indexOf(currentRole) > roles.indexOf(newRole)) {
      relatedRoles.push(newRole);
    }

    if (newRole && roles.indexOf(currentRole) < roles.indexOf(newRole)) {
      relatedRoles.push(currentRole);
    }

    let destinationRoll = null;
    let index = 0;

    while (index < roles.length) {
      if (_.includes(relatedRoles, roles[index])) {
        destinationRoll = roles[index];
        break;
      }
      index++
    };

    const params = { active: !!destinationRoll };
    if(destinationRoll) {
      params.role = destinationRoll;
    }
    resolve(params);
  })
}

function createAccountManager(object, callback) {
  object.errors = object.errors || {};
  if (object.errors.name) {
    return callback(null, object);
  }

  AccountUser.create(prepareAccountManagerParams(object.params, object.account, object.user), { transaction: object.transaction })
  .then(function(accountUser) {
    let contactList = selectAccountManagerContactList(object.contactLists);
    if(contactList) {
      let cluParams = contactListUserParams({ accountId: accountUser.AccountId, contactListId: contactList.id }, accountUser);
      models.ContactListUser.create(cluParams, {transaction: object.transaction}).then(function() {
        if (object.params.active == false) {
          emailConfirmation.sendEmailAccountConfirmationToken(object.params.email, accountUser.id, function(sendError, sendObject) {
            if (sendError) {
              _.merge(object.errors, filters.errors(sendError));
            }
            callback(null, object);
          });
        } else {
          callback(null, object);
        }
      }, function(error) {
        _.merge(object.errors, filters.errors(error));
        callback(null, object);
      });
    }
    else {
      object.errors.contactList = 'Contact List not found';
      callback(null, object);
    }
  }, function(error) {
    _.merge(object.errors, filters.errors(error));
    callback(null, object);
  });
}

function selectAccountManagerContactList(contactLists) {
  for(var i in contactLists) {
    if(contactLists[i].role == 'accountManager') {
      return contactLists[i];
    }
  }
}

function prepareAccountManagerParams(params, account, user) {
  let  defaultStruct = {
    owner: true,
    AccountId: account.id,
    UserId: user.id
  }
  if (params.role != 'admin') {
    params.role = 'accountManager';
  }
  return _.merge(params, defaultStruct);
}

function create(params, accountId, role, t) {
  let deferred = q.defer();

  AccountUser.create(buidAttrs(validateParams(params), accountId, role), { transaction: t }).then(function(result) {
    deferred.resolve(result);
  }, function(error) {
    deferred.reject(error);
  });
  return deferred.promise;
}

function validateParams(params) {
  return validateGender(params);
}

function validateGender(params) {
  params.gender = params.gender ? params.gender : params.gender = "";

  return params;
}

function buidAttrs(params, accountId, role) {
  let defaultStruct = {
    status: 'added',
    active: false,
    role: role,
    AccountId: params.accountId || accountId
  };
  return _.merge(params, defaultStruct);
}

function updateAccountUserWithId(data, userId, transaction, callback) {

  AccountUser.update(data, {
    where: {
      UserId: userId
    },
    transaction: transaction
  }).then(function (result) {
      callback(null, result);
  }).catch(function (err) {
    callback(err);
  });
}

function updateWithUserId(data, userId, callback) {
    let permitList = [
      "gender", "firstName", "lastName", "email", "gender", "mobile",
      "phoneCountryData", "landlineNumberCountryData", "landlineNumber", "companyName",
      "country", "postCode", "state", "city", "city", "postalAddress"
    ]

    let accountUserPermitParams = _.pick(data, permitList)
    let userPermitParams = _.pick(data, ['email'])

    models.sequelize.transaction().then(function(t) {
      User.find({
        where: {
          id: userId
        }
      }).then(function (result) {
        result.update(userPermitParams, {transaction: t}).then(function(updateResult) {
          updateAccountUserWithId(accountUserPermitParams, userId, t, function(err, accountUserResult) {
            if (err) {
              t.rollback().then(function() {
                callback(filters.errors(err));
              });
            } else {
              t.commit().then(function() {
                callback();
              });
            }
          });
        }).catch(function(updateError) {
          t.rollback().then(function() {
            callback(filters.errors(updateError));
          });
        });
      }).catch(function (err) {
        t.rollback().then(function() {
          callback(filters.errors(err));
        });
      });
  });
}

function findWithSessionMembers(userId, accountId) {
  let deferred = q.defer();

  AccountUser.find({
    attributes: VALID_ATTRIBUTES.accountUser,
    where: {
      AccountId: accountId,
      UserId: userId
    },
    include: [{
      model: SessionMember,
      attributes: VALID_ATTRIBUTES.sessionMember,
      required: false
    }]
  }).then(function(accountUser) {
    if(accountUser) {
      deferred.resolve(accountUser);
    }
    else {
      deferred.reject({ message: MessagesUtil.accountUser.notFound });
    }
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function contactListUserParams(params, accountUser) {
  return {
    userId: accountUser.UserId,
    accountUserId: accountUser.id,
    accountId: params.accountId,
    contactListId: params.contactListId,
    customFields: params.customFields || {}
  }
}

function findWithUser(user) {
  let deferred = q.defer();

  models.User.find({
    where: { id: user.id },
    include: [models.AccountUser],
  }).then(function(result) {
    assignCurrentUserInfo(result.AccountUsers[0] || {}, user);
    deferred.resolve(user);
  }, function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function findById(id) {
  let deferred = q.defer();

  AccountUser.find({
    where: { id: id },
    include: [models.Account]
  }).then(function(result) {
    deferred.resolve(result);
  }, function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function findWithEmail(email) {
  let deferred = q.defer();

  models.AccountUser.all({
    where: { email: { ilike: email } },
    include: [models.Invite],
  }).then(function(result) {
    deferred.resolve(result);
  }, function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function assignCurrentUserInfo(accountUser, user) {
  _.merge(user, _.pick(accountUser.dataValues, prepareValidAccountUserParams()));
  user.accountUserId = accountUser.id;
}

function prepareValidAccountUserParams() {
  let safeAccountUserParams = _.cloneDeep(constants.safeAccountUserParams);
  let index = safeAccountUserParams.indexOf('id');
  safeAccountUserParams.splice(index, 1);
  return safeAccountUserParams;
}

function updateNotInFutureInfo(id, sessionId) {
  return new Bluebird(function (resolve, reject) {
    sessionMemberService.isCloseEmailSentToSessionMember(id, sessionId).then(function(isSent) {
      if (isSent) {
        updateInfo(id, "NoInFuture").then(function(result) {
          resolve();
        }, function(error) {
          reject(error);
        });
      } else {
        reject(constants.closeSession.emailNotSent);
      }
    }, function(error) {
      reject(error);
    });
  });
}

//sessionName should be passed only if valueToIncrease == 'Accept'
function updateInfo(id, valueToIncrease, sessionName, transaction) {
  return new Bluebird(function (resolve, reject) {
    AccountUser.find({
      where: { id: id }
    }).then(function(accountUser) {
      let info = prepareInfo(accountUser.invitesInfo, valueToIncrease, sessionName);
      AccountUser.update({invitesInfo: info}, { where: { id: id }, transaction: transaction }).then(function (result) {
        resolve();
      }).catch(function (error) {
        reject(error);
      });
    }, function(error) {
      reject(error);
    });
  });
}

function prepareInfo(info, valueToIncrease, sessionName) {
  if (valueToIncrease) {
    if (valueToIncrease == "NoInFuture" || valueToIncrease == "NotAtAll") {
      info[valueToIncrease] = 1;
    } else {
      info[valueToIncrease]++;
    }
    switch(valueToIncrease) {
      case "Invites":
        info["NoReply"]++;
        break;
      case "NoInFuture":
        info["Future"] = "N";
        break;
      case "NotThisTime":
      case "NotAtAll":
        info["Future"] = "N";
        info["NoReply"]--;
        break;
      case "Accept":
        info["Future"] = "Y";
        info["NoReply"]--;
        if (sessionName) {
          info["LastSession"] = sessionName;
        }
        break;
    }
  }
  return info;
}

module.exports = {
  create: create,
  createAccountManager: createAccountManager,
  updateWithUserId: updateWithUserId,
  findWithUser: findWithUser,
  findWithSessionMembers: findWithSessionMembers,
  validateParams: validateParams,
  findWithEmail: findWithEmail,
  findById: findById,
  updateInfo: updateInfo,
  deleteOrRecalculate: deleteOrRecalculate,
  recalculateRole: recalculateRole,
  updateNotInFutureInfo: updateNotInFutureInfo
}
