'use strict';

const models = require('./../models');
const filters = require('./../models/filters');
const brandProjectConstants = require('../util/brandProjectConstants');
const { enqueue } = require('./backgroundQueue');
const { Invite,User, Account, AccountUser, Session, BrandProjectPreference } = models;

var moment = require('moment-timezone');
var emailDate = require('./formats/emailDate');
var AccountUserService = require('./accountUser');
var sessionMemberService = require('./sessionMember');
var socialProfileService = require('./socialProfile');
var inviteMailer = require('../mailers/invite');
var mailerHelpers = require('../mailers/mailHelper');
var constants = require('../util/constants');
var backgroundQueues = require('../util/backgroundQueue');
var MessagesUtil = require('./../util/messages');
var accountUserService = require('./accountUser');

var uuid = require('node-uuid');
var async = require('async');
var _ = require('lodash');
var q = require('q');
let Bluebird = require('bluebird');

var mailUrlHelper = require('../mailers/helpers');

const EXPIRE_AFTER_DAYS = 5;

function createBulkInvites(arrayParams) {
  return new Bluebird((resolve, reject) => {
    Bluebird.map(arrayParams, (params) => {
      return createInvite(params);
    }).then((invites) => {
      resolve(invites);
    }, (error) => {
      reject(error);
    });
  });
}

function deleteFacilitato(params) {
  return Invite.destroy({
    where: {
      sessionId: params.sessionId,
      accountUserId:  {
        $ne: params.accountUserId
      },
      role: 'facilitator'
    }
  })
}

function createFacilitatorInvite(params) {
  let deferred = q.defer();
  deleteFacilitato(params).then(function() {
    Invite.find({
      where: {
        sessionId: params.sessionId,
        accountUserId: params.accountUserId,
        role: 'facilitator'
      }
    }).then(function(invite) {
      if (invite) {
        deferred.resolve();
      } else {
        AccountUser.find({ where: { id: params.accountUserId } }).then(function(accountUser) {
          updateToFacilitator(accountUser).then(function() {
            createInvite(facilitatorInviteParams(accountUser, params.sessionId)).then(() => {
              deferred.resolve();
            }, function(error) {
              deferred.reject(filters.errors("Invite as Host for " + accountUser.firstName + " " + accountUser.lastName + " were not sent."));
            });
          }, function(error) {
            deferred.reject(filters.errors(error));
          });
        });
      }
    });
  },function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function updateToFacilitator(accountUser) {
  let deferred = q.defer();
  AccountUserService.deleteOrRecalculate(accountUser.id, 'facilitator', null).then((result) => {
    deferred.resolve(result);
  }, (error) => {
    deferred.reject(error);
  });
  return deferred.promise;
}

function facilitatorInviteParams(accountUser, sessionId) {
  return {
    accountUserId: accountUser.id,
    sessionId: sessionId,
    role: 'facilitator'
  }
}

function createInvite(params) {
  return new Bluebird((resolve, reject) => {
    let sql = {
      where: {
        accountUserId: params.accountUserId
      }
    }

    if (params.accountId) {
      sql.where.accountId = parseInt(params.accountId)
    }

    if (params.sessionId) {
      sql.where.sessionId = parseInt(params.sessionId)
    }

    let buildAttrs = {
      accountUserId: params.accountUserId,
      accountId: params.accountId,
      sessionId: params.sessionId,
      token: uuid.v1(),
      sentAt: new Date(),
      role: params.role
    }

    models.sequelize.transaction().then((transaction) => {
      Invite.build(buildAttrs).validate().done(() => {
        sql.transaction = transaction;
        Invite.destroy(sql).then((result) => {
          Invite.create(buildAttrs, {transaction: transaction}).then((result) => {
            enqueue(backgroundQueues.queues.invites, "invite", [result.id]).then(() => {
              Invite.find({where: {id: result.id}, include: { model: AccountUser, attributes: constants.safeAccountUserParams }, transaction: transaction}).then((invite)=> {
                transaction.commit().then(() => {
                  resolve(invite);
                });
              }, (error) => {
                resolve(result);
              });
            }, (error) => {
              reject(error);
            });
          }).catch(function(error) {
            transaction.rollback().then(() => {
              if(error.name == 'SequelizeUniqueConstraintError') {
                reject({ email: 'User has already been invited' });
              }else {
                reject(filters.errors(error));
              }
            });
          });
        });
      }, (error) => {
        reject(filters.errors(error));
      });
    });
  });
};

function simpleParams(invite, message) {
  return { invite: invite, message: message }
}

// TODO: Need explain function!
function sendInvite(inviteId, deferred) {
  if (!deferred) {
    deferred = q.defer();
  }

  Invite.find({
    include: [{
      model: AccountUser,
      attributes:
      constants.safeAccountUserParams,
      include: {model: models.ContactListUser}
    }, {
      model: Session,
      include: [Account]
    }, Account, User],
    where: {
      id: inviteId
    }
  }).then(function(invite) {
    if (!invite) { return deferred.reject(MessagesUtil.invite.notFound) }

    invite.unsubscribeMailUrl = mailUrlHelper.getUrl(invite.AccountUser.ContactListUsers[0].unsubscribeToken, null, '/unsubscribe/');
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
          timeZone: session.timeZone,
          orginalStartTime: moment.tz(session.startTime, session.timeZone).format(),
          orginalEndTime: moment.tz(session.endTime, session.timeZone).format(),
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
              accountUserService.updateInfo(invite.accountUserId, "Invites", null);
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
  });

  return deferred.promise;
}

function findAndRemoveAccountManagerInvite(params) {
  return new Bluebird((resolve, reject) => {
    let query = { where: {
      accountUserId: params.accountUserId,
      status: 'pending'
    },
      include: [
        {
          model: models.AccountUser,
          required: true
        }
      ]
    }

    Invite.find(query).then(function(invite) {
      if(invite) {
        removeInvite(invite).then((message) => {
          resolve(message);
        }, (error) => {
          reject(err);
        });
      }else {
        reject(MessagesUtil.invite.notFound);
      }
    });

  })
}

function removeInvite(invite) {
  return new Bluebird((resolve, reject) => {
    destroyInvite(invite).then((message) => {
      resolve(message);
    }, (error) => {
      reject(error);
    });
  });
};

function cleanupInvite(invite, transaction) {
  return new Bluebird((resolve, reject) => {
    if (invite.status == "confirmed") {
      if (invite.sessionId) {
        models.SessionMember.find({
          where: {
            accountUserId: invite.accountUserId,
            sessionId: invite.sessionId
          }
        }).then((sessionMember) => {
          sessionMember.destroy({transaction: transaction}).then(() => {
            AccountUserService.deleteOrRecalculate(invite.accountUserId, null, invite.role, transaction).then(() => {
              resolve();
            }, (error) => {
              reject(filters.errors(error));
            });
          });
        });
      }else{
        AccountUserService.deleteOrRecalculate(invite.accountUserId, null, invite.role, transaction).then(() => {
          resolve();
        }, (error) => {
          reject(filters.errors(error));
        });
      }
    }else{
      resolve();
    }
  })
}

function destroyInvite(invite) {
  return new Bluebird((resolve, reject) => {
    models.sequelize.transaction().then((transaction) => {
      invite.destroy({transaction: transaction}).then(() =>  {
        cleanupInvite(invite, transaction).then(() => {
          transaction.commit().then(() => {
            resolve(MessagesUtil.invite.removed);
          });
        }, (error) => {
          transaction.rollback().then(() => {
            reject(filters.errors(error));
          });
        });
      }, (error) => {
        reject(MessagesUtil.invite.cantRemove);
      }).catch((error) => {
        reject(filters.errors(error));
      });
    });
  });
}

function findInvite(token) {
  return new Bluebird((resolve, reject) => {
    Invite.find({ include: [Account, AccountUser], where: { token: token, $or: [{ status: 'pending' }, { status: 'inProgress' }] } }).then(function(result) {
      if(result) {
        resolve(result);
      }
      else {
        reject(MessagesUtil.invite.notFound);
      }
    });
  });
};

function processEmailStatus(id, apiResp, emailStatus) {
  return new Bluebird((resolve, reject) => {
    Invite.find({where: {id: id}, include: [AccountUser]}).then((invite) => {
      if (!invite) { return reject(MessagesUtil.invite.notFound) }

      let updateParams = {}

      if (apiResp) {
        updateParams.mailMessageId = apiResp.messageId;
        if (_.includes(apiResp.rejected, invite.AccountUser.email)) {
          updateParams.emailStatus = "failed";
        }
      }

      invite.update(updateParams).then(() => {
        resolve();
      }).catch((error) => {
        reject(error);
      });
    })
  })
}
function processMailWebhook(webhookParams) {
  let updateParams = {}
  
  if (webhookParams.event == "dropped") {
    updateParams.webhookMessage = webhookParams.reason
    updateParams.webhookEvent = webhookParams.event
    updateParams.webhookTime = new Date()
    updateParams.emailStatus = "failed";
  }

  if (webhookParams.event == "bounced") {
    updateParams.webhookMessage = webhookParams.error
    updateParams.webhookEvent = webhookParams.event
    updateParams.webhookTime = new Date()
    updateParams.emailStatus = "failed";
  }

  if (webhookParams.event == "delivered") {
    updateParams.emailStatus = "sent";
  }

  return new Bluebird((resolve, reject) => {
    if (updateParams.emailStatus) {
      let mailMessageId = webhookParams["Message-Id"].replace(/[<>]/g, "");

      Invite.update(updateParams, {where: {mailMessageId: mailMessageId}}).then((result) => {
        resolve(result);
      }, (error) => {
        reject(filters.errors(error))
      });
    }else{
      resolve([0]);
    }
  });
}

function declineInvite(token) {
  return new Bluebird((resolve, reject) => {
    findInvite(token).then((invite) => {
      invite.update({ status: 'rejected' }).then(() => {
        resolve({invite, message: MessagesUtil.invite.declined});
      }, (error) => {
        reject(filters.errors(error))
      }).catch(function(error) {
        reject(filters.errors(error))
      });
    }, (error) => {
      reject(error)
    })
  })
};

function findUserInSystemByEmail(email) {
  return User.find({where: {email: { ilike: email }} })
}
function checkUser(invite, user, params, transaction) {
  return new Bluebird((resolve, reject) => {
    if (user) {
      resolve()
    }else {
      if (!params.password) {
        reject("This invite is for new user need password for confirmation")
      }else {
        resolve()
      }
    }
  });
}

function checSession(invite, user, params, transaction) {
  return new Bluebird((resolve, reject) => {
    if (!invite.sessionId) { return resolve()}

    let where = { where: { sessionId: invite.sessionId, role: invite.role }, transaction: transaction };
    if(invite.role == 'facilitator') {
      models.SessionMember.find(where).then(function(sessionMember) {
        if(invite.accountUserId == sessionMember.accountUserId) {
          resolve();
        }
        else {
          reject(MessagesUtil.invite.inviteExpired);
        }
      });
    }
    else {
      models.Session.find({ where: { id: invite.sessionId }, transaction: transaction }).then(function(session) {
        models.SessionMember.count(where).then(function(count) {
          // TODO: Need to move to session member service or session service
          const allowedCount = {
            participant: session.type == 'forum' ? -1 : 8,
            observer: -1
          };

          if(count < allowedCount[invite.role] || allowedCount[invite.role] == -1) {
            resolve();
          }
          else {
            reject(MessagesUtil.invite.sessionIsFull);
          }
        });
      });
    }
  })
}

function createUser(invite, params, transaction) {
  let createParams = {
    confirmedAt: new Date(),
    password: params.password,
    email: invite.AccountUser.email
  }

  return User.create(createParams, { transaction: transaction });
}

function createUserIfNecessary(invite, user, params, transaction) {
  let selectedUser = user;
  return new Bluebird((resolve, reject) => {
    let flow = [
      (invite, user, params, transaction) => {
        return new Bluebird((resolve, reject) => {
          if (!user) {
            createUser(invite, params, transaction).then((newUser) => {
              selectedUser = newUser;
              resolve();
            }, (error) => {
              console.log(error);
              reject(filters.errors(error));
            })
          }else{
            resolve();
          }
        })
      },
      (_invite, user, _params, transaction) => {
        return updateAccountUsers(user, transaction);
      },
      (_invite, user, params, transaction) => {
        return new Bluebird((resolve, reject) => {
          if (params.social) {
            params.social.user = { id: user.id };
            resolve(socialProfileService.createPromise(params.social, transaction));
          }else{
            resolve();
          }
        });

      }
    ]

    Bluebird.each(flow, (step) => {
      return step(invite, selectedUser, params, transaction);
    }).then(() => {
      resolve(selectedUser);
    }, (error) => {
      reject(filters.errors(error))
    })

  })
}

function createSessionMemberIfNecessary(invite, transaction) {
  return new Bluebird((resolve, reject) => {
    if(invite.sessionId) {
      let params = {
        sessionId: invite.sessionId,
        accountUserId: invite.accountUserId,
        username: invite.AccountUser.firstName,
        role: invite.role,
        t: transaction
      };
      sessionMemberService.createWithTokenAndColour(params).then(() => {
        resolve();
      }, function(error) {
        reject(filters.errors(error));
      });
    } else {
      resolve();
    }
  })
}

function updateAccountUsers(newUser, transaction) {
  return new Bluebird((resolve, reject) => {
    AccountUser.update({"UserId": newUser.id}, {where: {"UserId": null, email: { ilike: newUser.email } }, transaction: transaction}).then(() =>{
      resolve();
    }, (error) => {
      reject(error);
    });
  })
}

function acceptInvite(token, params={}) {
  return new Bluebird((resolve, reject) => {
    let inviteAcceptFlow = [
      (invite, user, params, transaction) => {
        console.log("Invite step: checkUser", invite.id);
        return checkUser(invite, user, params, transaction)
      },
      (invite, user, params, transaction) => {
        console.log("Invite step: checSession", invite.id);
        return checSession(invite, user, params, transaction)
      },
      (invite, user, params, transaction) => {
        return createUserIfNecessary(invite, user, params, transaction)
      },
      (invite, _user, _params, transaction) => {
        console.log("Invite step: invite.update", invite.id);
        return invite.update({ status: 'confirmed' }, {transaction: transaction})
      },
      (invite, _user, _params, transaction) => {
        console.log("Invite step: setAccountUserActive", invite.id);
        return setAccountUserActive(invite, transaction)
      },
      (invite, _user, _params, transaction) => {
        console.log("Invite step: createSessionMemberIfNecessary", invite.id);
        return createSessionMemberIfNecessary(invite, transaction)
      },
      (invite, _user, _params, transaction) => {
        console.log("Invite step: shouldUpdateRole", invite.id);
        return shouldUpdateRole(invite.AccountUser, invite.role, transaction)
      }
    ]

    findInvite(token).then((invite) => {
      findUserInSystemByEmail(invite.AccountUser.email).then((user) => {
        models.sequelize.transaction().then((transaction) => {
          Bluebird.each(inviteAcceptFlow, (acceptStep) => {
            return acceptStep(invite, user, params, transaction);
          }).then(() => {
            transaction.commit().then(() => {
              findUserInSystemByEmail(invite.AccountUser.email).then((user) => {
                resolve({invite, user, message: MessagesUtil.invite.confirmed});
              }, (error) => {
                reject("User not found");
              })
            })
          }, (error) => {
            transaction.rollback().then(() => {
              console.log(error, "invite error" , invite.id);
              reject(error);
            });
          });
        });
      });
    }, (error) => {
      reject(error)
    });
  })
}

function shouldUpdateRole(accountUser, newRole, transaction) {
  return new Bluebird((resolve, reject) => {
    let roles = ['observer', 'participant', 'facilitator', 'accountManager', 'admin'];

    if(roles.indexOf(newRole) > roles.indexOf(accountUser.role)) {
      accountUser.update({ role: newRole }, {transaction: transaction}).then(() => {
        resolve()
      },(error) => {
        reject(filters.errors(error))
      })
    }
    else {
      resolve()
    }
  })
}

function setAccountUserActive(invite, transaction) {
  return new Bluebird((resolve, reject) => {
    AccountUser.update({active: true, status: 'active'}, { where: { id: invite.accountUserId }, transaction: transaction, returning: true }).then((result) => {
      resolve(result[1][0]);
    },(err) => {
      reject(filters.errors(error));
    })
  })
}

function acceptSessionInvite(token) {
  return new Bluebird((resolve, reject) => {
    findInvite(token).then((invite) => {
      invite.update({ token: uuid.v1(), status: 'inProgress' }, { returning: true }).then((invite) => {
        if (invite.sessionId) {
          models.Session.find({ where: { id: invite.sessionId } }).then(function(session) {
            accountUserService.updateInfo(invite.accountUserId, "Accept", session.name);
          });
        } else {
          accountUserService.updateInfo(invite.accountUserId, "Accept", "-");
        }
        resolve({ message: MessagesUtil.invite.confirmed, invite: invite });
      }, (error) => {
        reject(filters.errors(error));
      });
    }, (error) => {
      reject(error);
    })
  });
}

function declineSessionInvite(token, status) {
  return new Bluebird((resolve, reject) => {
    findInvite(token).then((invite) => {
      invite.update({ status: status }).then(() => {
        sendEmail(status, invite).then(() =>  {
          resolve({ message: MessagesUtil.invite.declined, invite: invite });
        }, (error) => {
          reject(error);
        });
        let preparedStatus = status.charAt(0).toUpperCase() + status.slice(1);
        accountUserService.updateInfo(invite.accountUserId, preparedStatus, null);
      }, function(error) {
        deferred.reject(filters.errors(error));
      }, (error) =>  {
        reject(filters.errors(error));
      });
    });
  });
}

function sendEmail(status, invite) {
  let deferred = q.defer();

  prepareMailInformation(invite).then(function(data) {
    let doSendEmail = null;

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
  let deferred = q.defer();

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
  let deferred = q.defer();

  let object = {
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
    timeZone: emailDate.format("timeZone", session.startTime, session.timeZone),
    orginalStartTime: moment(session.startTime).tz(session.timeZone).format(),
    orginalEndTime: moment(session.endTime).tz(session.timeZone).format() ,
    logInUrl: mailUrlHelper.getUrl(invite.token, null, '/invite/') + '/accept/',
    confirmationCheckInUrl: mailUrlHelper.getUrl(invite.token, null, '/invite/') + '/accept/',
    participantMail: receiver.email,
    incentive: session.incentive
  }

  populateMailParamsWithColors(object, session).then(function(res) {
    deferred.resolve(res);
  }, function (error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function populateMailParamsWithColors(params, session){
  let deferred = q.defer();

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

module.exports = {
  messages: MessagesUtil.invite,
  sendInvite: sendInvite,
  processEmailStatus: processEmailStatus,
  processMailWebhook: processMailWebhook,
  createBulkInvites: createBulkInvites,
  createInvite: createInvite,
  findAndRemoveAccountManagerInvite: findAndRemoveAccountManagerInvite,
  removeInvite: removeInvite,
  findInvite: findInvite,
  acceptInvite: acceptInvite,
  declineInvite: declineInvite,
  declineSessionInvite: declineSessionInvite,
  acceptSessionInvite: acceptSessionInvite,
  createFacilitatorInvite: createFacilitatorInvite,
  populateMailParamsWithColors: populateMailParamsWithColors,
  updateToFacilitator: updateToFacilitator,
  findUserInSystemByEmail: findUserInSystemByEmail
};
