'use strict';

var models = require('./../models');
var filters = require('./../models/filters');
var Invite = models.Invite;
var User = models.User;
var Account = models.Account;
var AccountUser = models.AccountUser;
var Session = models.Session;

var sessionMemberService = require('./../services/sessionMember');
var inviteMailer = require('../mailers/invite');
var constants = require('../util/constants');

var dateFormat = require('dateformat');
var uuid = require('node-uuid');
var async = require('async');
var _ = require('lodash');
var q = require('q');

const EXPIRE_AFTER_DAYS = 5;

const MESSAGES = {
  confirmed: 'You have successfully accepted Invite. Please login using your invite e-mail and password.',
  removed: 'Successfully removed Invite',
  cantRemove: "Can't remove this invite",
  declined: 'Successfully declined invite'
};

function createBulkInvites(arrayParams) {
  let deferred = q.defer();

  let expireDate = new Date();
  expireDate.setDate(expireDate.getDate() + EXPIRE_AFTER_DAYS);
  _.map(arrayParams, function(paramObject) {
    paramObject.token = uuid.v1();
    paramObject.sentAt = new Date();
    paramObject.expireAt = expireDate;
  });

  Invite.bulkCreate(arrayParams, {
    validate: true,
    returning: true
  }).then(function(results) {
    if(results.length > 0) {
      let ids = _.map(results, 'id');
      Invite.findAll({
        where: { id: { $in: ids } },
        include: [{
          model: AccountUser,
          attributes:
          constants.safeAccountUserParams
        }, Account, Session, User]
      }).then(function(invites) {
        async.each(invites, function(invite, callback) {
          sendInvite(invite).then(function() {
            callback();
          }, function(error) {
            callback(error);
          });
        }, function(error) {
          if(error) {
            deferred.reject(error);
          }
          else {
            deferred.resolve(results);
          }
        });
      }).catch(function(error) {
        deferred.reject(filters.errors(error));
      });
    }
    else {
      deferred.reject("None created");
    }
  }).catch(function(error) {
    if(error.name == 'SequelizeUniqueConstraintError') {
      deferred.reject({ email: 'User has already been invited' });
    }
    else {
      deferred.reject(filters.errors(error));
    }
  });

  return deferred.promise;
}

function createInvite(params) {
  let deferred = q.defer();

  let token = uuid.v1();
  let expireDate = new Date();
  expireDate.setDate(expireDate.getDate() + EXPIRE_AFTER_DAYS);

  Invite.create({
    accountUserId: params.accountUserId,
    userId: params.userId,
    accountId: params.accountId,
    sessionId: params.sessionId,
    token: token,
    sentAt: new Date(),
    expireAt: expireDate,
    role: params.role,
    userType: params.userType
  }).then(function(result) {
    Invite.find({
      include: [{
        model: AccountUser,
        attributes:
        constants.safeAccountUserParams
      }, Account, Session, User],
      where: {
        token: token
      }
    }).then(function(invite) {
      sendInvite(invite, deferred);
    });
  }).catch(function(error) {
    if(error.name == 'SequelizeUniqueConstraintError') {
      deferred.reject({ email: 'User has already been invited' });
    }
    else {
      deferred.reject(filters.errors(error));
    }
  });

  return deferred.promise;
};

function simpleParams(invite, message) {
  return { invite: invite, message: message }
}

function sendInvite(invite, deferred) {
  if(!deferred) {
    deferred = q.defer();
  }

  if(invite.accountId) {
    let inviteParams = {
      token: invite.token,
      email: invite.AccountUser.email,
      firstName: invite.AccountUser.firstName,
      lastName: invite.AccountUser.lastName,
      accountName: invite.Account.name,
      accountId: invite.Account.id
    };

    inviteMailer.sendInviteAccountManager(inviteParams, function(error, data) {
      if(error) {
        deferred.reject(error);
      }
      else {
        deferred.resolve(simpleParams(invite));
      }
    });
  }
  else {
    let session = invite.Session;
    models.SessionMember.find({
      where: {
        sessionId: session.id,
        role: 'facilitator'
      },
      include: [AccountUser]
    }).then(function(sessionMember) {
      let facilitator = sessionMember.AccountUser;
      let inviteParams = {
        sessionId: session.id,
        role: invite.role,
        accountId: session.accountId,
        token: invite.token,
        firstName: invite.AccountUser.firstName,
        lastName: invite.AccountUser.lastName,
        accountName: "cant get",
        email: invite.AccountUser.email,
        sessionName: session.name,
        startTime: dateFormat(invite.startDate, 'h:MM:ss'),
        endTime: dateFormat(invite.endDate, 'h:MM:ss'),
        startDate: dateFormat(invite.startDate, 'yyyy-mm-dd'),
        endDate: dateFormat(invite.endDate, 'yyyy-mm-dd'),
        incentive: session.incentive_details,
        facilitatorFirstName: facilitator.firstName,
        facilitatorLastName: facilitator.lastName,
        facilitatorMail: facilitator.email,
        facilitatorMobileNumber: facilitator.mobile,
        unsubscribeMailUrl: 'some unsub url'
      }
      inviteMailer.sendInviteSession(inviteParams, function(error, data) {
        if(error) {
          deferred.reject(error);
        }
        else {
          deferred.resolve(simpleParams(invite));
        }
      });
    }).catch(function(error) {
      deferred.reject(filters.errors(error));
    });
  }

  return deferred.promise;
}

function findAndRemoveInvite(params, callback) {
  Invite.find({ where: params }).then(function(invite) {
    if(invite) {
      removeInvite(invite, function(err, message) {
        callback(err, message);
      });
    }
    else {
      callback('Invite not found');
    }
  });
}

function removeInvite(invite, callback) {
  if(invite.userType == 'new') {
    removeAllAssociatedDataOnNewUser(invite, function(error, message) {
      callback(error, message);
    });
  }
  else {
    destroyInvite(invite, function(error, message) {
      callback(error, message);
    });
  }
};

function destroyInvite(invite, callback) {
  Invite.destroy({
    where: {
      id: invite.id,
      status: 'pending'
    }
  }).then(function(res) {
    if(res > 0) {
      callback(null, MESSAGES.removed);
    }
    else {
      callback(MESSAGES.cantRemove);
    }
  }).catch(function(error) {
    callback(filters.errors(error));
  });
}

function findInvite(token, callback) {
  Invite.find({ include: [Account, AccountUser, User], where: { token: token, status: 'pending' } }).then(function(result) {
    if(result) {
      callback(null, result);
    }
    else {
      callback('Invite not found');
    }
  });
};

function declineInvite(token, callback) {
  findInvite(token, function(error, invite) {
    if(error) {
      callback(error);
    }
    else {
      invite.update({ status: 'rejected' }).then(function() {
        callback(null, invite, MESSAGES.declined);
      }).catch(function(error) {
        callback(filters.errors(error));
      });
    }
  })
};

function acceptInviteExisting(token, callback) {
  findInvite(token, function(error, invite) {
    if(error) {
      return callback(error);
    }
    else if(invite.userType == 'new') {
      return callback(null, invite);
    }
    setAccountUserActive(invite.accountUserId, function(err, result) {
      if(err) {
        return callback(err);
      }

      invite.update({ status: 'confirmed' }).then(function() {
        callback(null, invite, MESSAGES.confirmed);
      }).catch(function(error) {
        callback(filters.errors(error));
      });
    });
  });
};

function acceptInviteNew(token, params, callback) {
  findInvite(token, function(error, invite) {
    if(error) {
      return callback(error);
    }
    else if(invite.userType == 'existing') {
      return callback(true);
    }

    updateUser({ password: params.password }, invite, function(error, user) {
      if(error) {
        callback(error, invite);
      }
      else {
        invite.update({ status: 'confirmed' }).then(function() {
          callback(null, invite, MESSAGES.confirmed);
        }).catch(function(error) {
          callback(filters.errors(error));
        });
      };
    });
  });
};
function setAccountUserActive(accountUserId, callback) {
  AccountUser.update({active: true, status: "active"}, { where:{ id: accountUserId } }).then(function(result) {
    callback(null, result);
  },function(err) {
    callback(filters.errors(error));
  })
}

function updateUser(params, invite, callback) {
  setAccountUserActive(invite.accountUserId, function(res, _) {
    params.confirmedAt = new Date();
    User.update(params, { where: { id: invite.userId } }).then(function(result) {
      callback(null, true);
    }).catch(function(error) {
      callback(filters.errors(error));
    });
  })
};

function sessionAccept(token, password) {
  let deferred = q.defer();

  findInvite(token, function(error, invite) {
    if(error) {
      deferred.reject(error);
    }
    else {
      let params = {
        sessionId: invite.sessionId,
        accountUserId: invite.accountUserId,
        username: invite.AccountUser.firstName,
        role: invite.role
      };

      User.create({ email: invite.AccountUser.email, password: password, confirmedAt: new Date()  }).then(function(user) {
        invite.AccountUser.update({ UserId: user.id, active:true}).then(function() {
          sessionMemberService.createWithTokenAndColour(params).then(function() {
            invite.update({ status: 'confirmed' }).then(function() {
              deferred.resolve(MESSAGES.confirmed);
            }, function(error) {
              deferred.reject(filters.errors(error));
            });
          }, function(error) {
            deferred.reject(filters.errors(error));
          });
        }, function(error) {
          deferred.reject(filters.errors(error));
        });
      }, function(error) {
        deferred.reject(filters.errors(error));
      });
    }
  });

  return deferred.promise;
}

function declineSessionInvite(token, status) {
  let deferred = q.defer();

  findInvite(token, function(error, invite) {
    if(error) {
      deferred.reject(error);
    }
    else {
      invite.update({ status: status }).then(function() {
        deferred.resolve(MESSAGES.declined);
      }, function(error) {
        deferred.reject(filters.errors(error));
      });
    }
  });

  return deferred.promise;
}

//Helpers
function removeAllAssociatedDataOnNewUser(invite, callback) {
  async.waterfall([
    function(cb) {
      User.find({ where: { id: invite.userId } }).then(function(user) {
        if(user) {
          cb(null, user);
        }
        else {
          cb('Not found user');
        }
      }).catch(function(error) {
        cb(filters.errors(error));
      });
    },
    function(user, cb) {
      user.destroy().then(function() {
        cb();
      }).catch(function(error) {
        cb(filters.errors(error));
      });
    }
  ], function(error) {
    callback(error, MESSAGES.removed);
  });
}

module.exports = {
  messages: MESSAGES,
  createBulkInvites: createBulkInvites,
  createInvite: createInvite,
  findAndRemoveInvite: findAndRemoveInvite,
  removeInvite: removeInvite,
  findInvite: findInvite,
  acceptInviteExisting: acceptInviteExisting,
  acceptInviteNew: acceptInviteNew,
  declineInvite: declineInvite,
  declineSessionInvite: declineSessionInvite,
  sessionAccept: sessionAccept
};
