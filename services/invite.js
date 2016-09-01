'use strict';

var models = require('./../models');
var filters = require('./../models/filters');
var Invite = models.Invite;
var User = models.User;
var Account = models.Account;
var AccountUser = models.AccountUser;
var Session = models.Session;

var sessionMemberService = require('./../services/sessionMember');
var socialProfileService = require('./socialProfile');
var inviteMailer = require('../mailers/invite');
var mailerHelpers = require('../mailers/mailHelper');
var constants = require('../util/constants');
var MessagesUtil = require('./../util/messages');

var dateFormat = require('dateformat');
var moment = require('moment');
var uuid = require('node-uuid');
var crypto = require('crypto');
var async = require('async');
var _ = require('lodash');
var q = require('q');

var mailUrlHelper = require('../mailers/helpers');

const EXPIRE_AFTER_DAYS = 5;

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
          constants.safeAccountUserParams,
          include: {model: models.ContactListUser}
        }, {
          model: Session,
          include: [Account]
        }, Account, User]
      }).then(function(invites) {
        async.each(invites, function(invite, callback) {
          invite.accountName = arrayParams.accountName;
          if (invite.AccountUser.ContactListUsers.length) {
            invite.unsubscribeMailUrl = mailUrlHelper.getUrl(invite.AccountUser.ContactListUsers[0].unsubscribeToken, '/unsubscribe/');

            sendInvite(invite).then(function() {
              callback();
            }, function(error) {
              callback(error);
            });
          } else {
            callback();
          }
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
    deferred.reject(filters.errors(error));
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
      }, {
        model: Session,
        include: [Account]
      }, Account, User],
      where: {
        token: token
      }
    }).then(function(invite) {
      invite.accountName = params.accountName;
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
      role: invite.role,
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
        accountName: session.Account.name,
        email: invite.AccountUser.email,
        sessionName: session.name,
        orginalStartTime: session.startTime,
        orginalEndTime: session.endTime,
        startTime: moment.utc(session.startTimeFormat).format('h:mm'),
        endTime: moment.utc(session.endTimeFormat).format('h:mm'),
        startDate: moment.utc(session.startTimeFormat).format('YYYY-M-D'),
        endDate: moment.utc(session.endTimeFormat).format('YYYY-M-D'),
        incentive: session.incentive_details,
        facilitatorFirstName: facilitator.firstName,
        facilitatorLastName: facilitator.lastName,
        facilitatorMail: facilitator.email,
        facilitatorMobileNumber: facilitator.mobile,
        unsubscribeMailUrl: invite.unsubscribeMailUrl
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
      callback(null, MessagesUtil.invite.removed);
    }
    else {
      callback(MessagesUtil.invite.cantRemove);
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
        callback(null, invite, MessagesUtil.invite.declined);
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
    setAccountUserActive(invite, function(err, result) {
      if(err) {
        return callback(err);
      }

      invite.update({ status: 'confirmed' }).then(function() {
        if(invite.sessionId) {
          let params = {
            sessionId: invite.sessionId,
            accountUserId: invite.accountUserId,
            username: invite.AccountUser.firstName,
            role: invite.role
          };
          sessionMemberService.createWithTokenAndColour(params).then(function() {
            sendEmail('inviteConfirmation', invite).then(function() {
              callback(null, invite, MessagesUtil.invite.confirmed);
            }, function(error) {
              callback(error);
            });
          }, function(error) {
            callback(filters.errors(error));
          });
        }
        else {
          callback(null, invite, MessagesUtil.invite.confirmed);
        }
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
          callback(null, invite, user, MessagesUtil.invite.confirmed);
        }).catch(function(error) {
          callback(filters.errors(error));
        });
      };
    });
  });
};
function setAccountUserActive(invite, callback) {
  AccountUser.update({active: true, status: 'active'}, { where:{ id: invite.accountUserId } }).then(function(result) {
    callback(null, result);
  },function(err) {
    callback(filters.errors(error));
  })
}

function updateUser(params, invite, callback) {
  setAccountUserActive(invite, function(res, _) {
    params.confirmedAt = new Date();
    User.update(params, { where: { id: invite.userId }, returning: true }).then(function(result) {
      callback(null, result[1][0]);
    }).catch(function(error) {
      callback(filters.errors(error));
    });
  })
};

function sessionAccept(token, body) {
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

      if(body.social) {
        body.password = crypto.randomBytes(16).toString('hex');
      }

      User.create({ email: invite.AccountUser.email, password: body.password, confirmedAt: new Date()  }).then(function(user) {
        invite.AccountUser.update({ UserId: user.id, active:true}).then(function() {
          sessionMemberService.createWithTokenAndColour(params).then(function() {
            invite.update({ status: 'confirmed' }).then(function() {
              if(body.social) {
                body.social.user = { id: user.id };
                socialProfileService.create(body.social, function(error, object) {
                  if(object.error) {
                    deferred.reject(object.error);
                  }
                  else {
                    sendEmail('inviteConfirmation', invite).then(function() {
                      deferred.resolve({ message: MessagesUtil.invite.confirmed, user: user });
                    }, function(error) {
                      deferred.reject(error);
                    });
                  }
                });
              }
              else {
                sendEmail('inviteConfirmation', invite).then(function() {
                  deferred.resolve({ message: MessagesUtil.invite.confirmed, user: user });
                }, function(error) {
                  deferred.reject(error);
                });
              }
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

function acceptSessionInvite(token) {
  let deferred = q.defer();

  findInvite(token, function(error, invite) {
    if(error) {
      deferred.reject(error);
    }
    else {
      invite.update({ token: uuid.v1() }, { returning: true }).then(function(invite) {
        sendEmail('inviteConfirmation', invite).then(function() {
          deferred.resolve({ message: MessagesUtil.invite.confirmed, invite: invite });
        }, function(error) {
          deferred.reject(error);
        })
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
        sendEmail(status, invite).then(function() {
          deferred.resolve({ message: MessagesUtil.invite.declined, invite: invite });
        }, function(error) {
          deferred.reject(error);
        })
      }, function(error) {
        deferred.reject(filters.errors(error));
      });
    }
  });

  return deferred.promise;
}

function sendEmail(status, invite) {
  let deferred = q.defer();

  prepareMailInformation(invite).then(function(data) {
    let doSendEmail;

    if(status == 'notAtAll') {
      doSendEmail = mailerHelpers.sendInvitationNotAtAll;
    }
    else if(status == 'notThisTime') {
      doSendEmail = mailerHelpers.sendInvitationNotThisTime;
    }
    else if(status == 'inviteConfirmation') {
      doSendEmail = mailerHelpers.sendInviteConfirmation;
    }
    else {
      return deferred.resolve();
    }

    doSendEmail(data, function(error, result) {
      if(error) {
        deferred.reject(error);
      }
      else {
        deferred.resolve(result);
      }
    });
  }, function(error) {
    deferred.reject(error);
  })

  return deferred.promise;
}

//Helpers
function prepareMailInformation(invite) {
  let deferred = q.defer();

  models.SessionMember.find({
    where: {
      sessionId: invite.sessionId,
      role: 'facilitator'
    },
    include: [AccountUser, Session]
  }).then(function(facilitator) {
    deferred.resolve(prepareMailParams(facilitator.Session, invite.AccountUser, facilitator.AccountUser));
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function prepareMailParams(session, receiver, facilitator) {
  return {
    sessionId: session.id,
    email: receiver.email,
    role: receiver.role,
    firstName: receiver.firstName, //receiver name
    facilitatorFirstName: facilitator.firstName,
    facilitatorLastName: facilitator.lastName,
    facilitatorMail: facilitator.email,
    facilitatorMobileNumber: facilitator.mobile,
    unsubscribeMailUrl: 'not-found',
    startTime: session.startTime,
    startDate: session.startDate,
    orginalStartTime: session.startTime,
    orginalEndTime: session.endTime,
    confirmationCheckInUrl: mailUrlHelper.getUrl('', '/login'),
    participantMail: receiver.email,
    incentive: session.incentive
  }
}

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
    callback(error, MessagesUtil.invite.removed);
  });
}

module.exports = {
  messages: MessagesUtil.invite,
  createBulkInvites: createBulkInvites,
  createInvite: createInvite,
  findAndRemoveInvite: findAndRemoveInvite,
  removeInvite: removeInvite,
  findInvite: findInvite,
  acceptInviteExisting: acceptInviteExisting,
  acceptInviteNew: acceptInviteNew,
  declineInvite: declineInvite,
  declineSessionInvite: declineSessionInvite,
  acceptSessionInvite: acceptSessionInvite,
  sessionAccept: sessionAccept
};
