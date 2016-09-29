'use strict';

var models = require('./../models');
var filters = require('./../models/filters');
var brandProjectConstants = require('../util/brandProjectConstants');

var Invite = models.Invite;
var User = models.User;
var Account = models.Account;
var AccountUser = models.AccountUser;
var Session = models.Session;
var BrandProjectPreference = models.BrandProjectPreference;

var moment = require('moment-timezone');
var emailDate = require('./formats/emailDate');
var sessionMemberService = require('./sessionMember');
var socialProfileService = require('./socialProfile');
var inviteMailer = require('../mailers/invite');
var mailerHelpers = require('../mailers/mailHelper');
var constants = require('../util/constants');
var MessagesUtil = require('./../util/messages');

var uuid = require('node-uuid');
var crypto = require('crypto');
var async = require('async');
var _ = require('lodash');
var q = require('q');

var mailUrlHelper = require('../mailers/helpers');

const EXPIRE_AFTER_DAYS = 5;

function createBulkInvites(arrayParams) {
  var deferred = q.defer();

  var expireDate = new Date();
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
      var ids = _.map(results, 'id');
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
  var deferred = q.defer();

  var token = uuid.v1();
  var expireDate = new Date();
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
    var inviteParams = {
      token: invite.token,
      role: invite.role,
      email: invite.AccountUser.email,
      firstName: invite.AccountUser.firstName,
      lastName: invite.AccountUser.lastName,
      accountName: invite.Account.name,
      accountId: invite.Account.id
    };
    populateMailParamsWithColors(inviteParams, invite.Session).then(function (params) {
      inviteMailer.sendInviteAccountManager(params, function (error, data) {
        if (error) {
          deferred.reject(error);
        }
        else {
          deferred.resolve(simpleParams(invite));
        }
      });
    }, function (error) {
      deferred.reject(filters.errors(error));
    });
  }
  else {
    var session = invite.Session;
    models.SessionMember.find({
      where: {
        sessionId: session.id,
        role: 'facilitator'
      },
      include: [AccountUser]
    }).then(function(sessionMember) {
      var facilitator = sessionMember.AccountUser;
      var inviteParams = {
        sessionId: session.id,
        role: invite.role,
        accountId: session.accountId,
        token: invite.token,
        firstName: invite.AccountUser.firstName,
        lastName: invite.AccountUser.lastName,
        accountName: session.Account.name,
        email: invite.AccountUser.email,
        sessionName: session.name,
        timeZone: session.timeZone,
        orginalStartTime: moment(session.startTime).tz(session.timeZone).format(),
        orginalEndTime: moment(session.endTime).tz(session.timeZone).format(),
        startTime: emailDate.format('time', session.startTime, session.timeZone),
        endTime: emailDate.format('time', session.endTime, session.timeZone),
        startDate: emailDate.format('date', session.startTime, session.timeZone),
        endDate: emailDate.format('date', session.endTime, session.timeZone),
        incentive: session.incentive_details,
        facilitatorFirstName: facilitator.firstName,
        facilitatorLastName: facilitator.lastName,
        facilitatorMail: facilitator.email,
        facilitatorMobileNumber: facilitator.mobile,
        unsubscribeMailUrl: invite.unsubscribeMailUrl
      }

      populateMailParamsWithColors(inviteParams, session).then(function (params) {
        inviteMailer.sendInviteSession(params, function(error, data) {
            if (error) {
            deferred.reject(error);
          }
          else {
            deferred.resolve(simpleParams(invite));
          }
        });
      }, function (error) {
        deferred.reject(filters.errors(error));
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
  Invite.find({ include: [Account, AccountUser, User], where: { token: token, $or: [{ status: 'pending' }, { status: 'inProgress' }] } }).then(function(result) {
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
    setAccountUserActive(invite, function(err, accountUser) {
      if(err) {
        return callback(err);
      }

      invite.update({ status: 'confirmed' }).then(function() {
        if(invite.sessionId) {
          var params = {
            sessionId: invite.sessionId,
            accountUserId: invite.accountUserId,
            username: invite.AccountUser.firstName,
            role: invite.role
          };

          sessionMemberService.createWithTokenAndColour(params).then(function() {
            shouldUpdateRole(accountUser, invite.role).then(function() {
              callback(null, invite, MessagesUtil.invite.confirmed);
            }, function(error) {
              callback(filters.errors(error));
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

function shouldUpdateRole(accountUser, newRole) {
  var roles = ['observer', 'participant', 'facilitator', 'accountManager', 'admin'];

  if(roles.indexOf(newRole) > roles.indexOf(accountUser.role)) {
    return accountUser.update({ role: newRole });
  }
  else {
    var deferred = q.defer();
    deferred.resolve();
    return deferred.promise;
  }
}

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
  AccountUser.update({active: true, status: 'active'}, { where:{ id: invite.accountUserId }, returning: true }).then(function(result) {
    callback(null, result[1][0]);
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
  var deferred = q.defer();

  findInvite(token, function(error, invite) {
    if(error) {
      deferred.reject(error);
    }
    else {
      canAddSessionMember(invite).then(function() {
        return sessionAcceptFlow(invite, body);
      }).then(function(result) {
        deferred.resolve(result);
      }).catch(function(error) {
        deferred.reject(error);
      });
    }
  });

  return deferred.promise;
}

function sessionAcceptFlow(invite, body) {
  var deferred = q.defer();
  var user;

  models.sequelize.transaction().then(function(t) {
    return User.create({ email: invite.AccountUser.email, password: body.password, confirmedAt: new Date() }, { transaction: t }).then(function(result) {
      user = result;
      return invite.AccountUser.update({ UserId: user.id, active: true }, { transaction: t });
    }).then(function() {
      var params = sessionMemberParams(invite, t);
      return sessionMemberService.createWithTokenAndColour(params);
    }).then(function() {
      return invite.update({ status: 'confirmed' }, { transaction: t });
    }).then(function() {
      if(body.social) {
        body.social.user = { id: user.id };
        return socialProfileService.createPromise(body.social, t);
      }
      else {
        return t.commit();
      }
    }).catch(function(error) {
      throw error;
    });
  }).then(function() {
    deferred.resolve({ message: MessagesUtil.invite.confirmed, user: user });
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function canAddSessionMember(invite) {
  var deferred = q.defer();
  var where = { where: { sessionId: invite.sessionId, role: invite.role } };

  if(invite.role == 'facilitator') {
    models.SessionMember.find(where).then(function(sessionMember) {
      if(invite.accountUserId == sessionMember.accountUserId) {
        deferred.resolve();
      }
      else {
        deferred.reject(MessagesUtil.invite.inviteExpired);
      }
    });
  }
  else {
    var session = invite.Session;
    models.SessionMember.count(where).then(function(c) {
      var allowedCount = {
        participant: session.type == 'forum' ? constants.membersAllowedCount.participantsForum : constants.membersAllowedCount.participantsFocus,
        observer: constants.membersAllowedCount.observers
      };

      if(c < allowedCount[invite.role] || allowedCount[invite.role] == -1) {
        deferred.resolve();
      }
      else {
        deferred.reject(MessagesUtil.invite.sessionIsFull);
      }
    });
  }

  return deferred.promise;
}

function sessionMemberParams(invite, t) {
  return {
    sessionId: invite.sessionId,
    accountUserId: invite.accountUserId,
    username: invite.AccountUser.firstName,
    role: invite.role,
    t: t
  };
}

function acceptSessionInvite(token) {
  var deferred = q.defer();

  findInvite(token, function(error, invite) {
    if(error) {
      deferred.reject(error);
    }
    else {
      invite.update({ token: uuid.v1(), status: 'inProgress' }, { returning: true }).then(function(invite) {
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
  var deferred = q.defer();

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
  var deferred = q.defer();

  prepareMailInformation(invite).then(function(data) {
    var doSendEmail = null;

    switch (status) {
      case 'notAtAll':
        doSendEmail = mailerHelpers.sendInvitationNotAtAll;
        break;
      case 'notThisTime':
        doSendEmail = mailerHelpers.sendInvitationNotThisTime;
        break;
      case 'inviteConfirmation':
        if(invite.role == 'participant') {
          doSendEmail = mailerHelpers.sendInviteConfirmation;
        }
        else if(invite.role == 'facilitator') {
          doSendEmail = mailerHelpers.sendFacilitatorEmailConfirmation;
        }
        break;
      default:
        return deferred.resolve();
    }

    if (!doSendEmail) {
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
  var deferred = q.defer();

  models.SessionMember.find({
    where: {
      sessionId: invite.sessionId,
      role: 'facilitator'
    },
    include: [AccountUser, Session]
  }).then(function (facilitator) {
    prepareMailParams(invite, facilitator.Session, invite.AccountUser, facilitator.AccountUser).then(function(res) {
      deferred.resolve(res);
    }, function (error) {
      deferred.reject(filters.errors(error));
    });
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function prepareMailParams(invite, session, receiver, facilitator) {
  var deferred = q.defer();

  var object = {
    sessionId: session.id,
    email: receiver.email,
    role: receiver.role,
    firstName: receiver.firstName, //receiver name
    facilitatorFirstName: facilitator.firstName,
    facilitatorLastName: facilitator.lastName,
    facilitatorMail: facilitator.email,
    facilitatorMobileNumber: facilitator.mobile,
    unsubscribeMailUrl: 'not-found',
    startTime: emailDate.format('time', session.startTime, session.timeZone),
    startDate: emailDate.format('date', session.startTime, session.timeZone),
    orginalStartTime: session.startTime,
    orginalEndTime: session.endTime,
    logInUrl: mailUrlHelper.getUrl(invite.token, '/invite/') + '/accept/',
    confirmationCheckInUrl: mailUrlHelper.getUrl(invite.token, '/invite/') + '/accept/',
    participantMail: receiver.email,
    incentive: session.incentive
  }

  return populateMailParamsWithColors(object, session).then(function(res) {
    deferred.resolve(res);
  }, function (error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function populateMailParamsWithColors(params, session)
{
  var deferred = q.defer();

  _.each(brandProjectConstants.preferenceColours, function (value, key) {
    if (typeof(value) == "object") {
      _.each(value, function (objValue, objKey) {
        params[objKey] = objValue;
      });
    } else {
      params[key] = value;
    }
  });

  if (session) {
    BrandProjectPreference.find({ where: { id: session.brandProjectPreferenceId, accountId: session.accountId } }).then(function(scheme) {
      if(scheme) {
        _.each(scheme.colours, function (value, key) {
          params[key] = value;
        });
      }
      deferred.resolve(params);
    }, function (error) {
      deferred.reject(filters.errors(error));
    });
  } else {
    deferred.resolve(params);
  }

  return deferred.promise;
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
