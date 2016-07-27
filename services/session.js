'use strict';

var policy = require('./../middleware/policy');
var models = require('./../models');
var filters = require('./../models/filters');
var subscriptionService = require('./subscription');
var topicsService = require('./topics');
var Session  = models.Session;
var Invite  = models.Invite;
var SessionMember  = models.SessionMember;
var AccountUser  = models.AccountUser;
var Account  = models.Account;

var q = require('q');
var _ = require('lodash');
var async = require('async');
var MailTemplateService = require('./mailTemplate');

var sessionMemberServices = require('./../services/sessionMember');
var validators = require('./../services/validators');


const VALID_ATTRIBUTES = {
  sessionMember: ['id', 'role', 'rating', 'sessionId', 'accountUserId', 'username', 'comment']
};

const MESSAGES = {
  notFound: 'Session not found',
  removed: 'Session sucessfully removed',
  copied: 'Session sucessfully copied',
  sessionMemberNotFound: 'Session Member not found',
  rated: 'Session Member rated',
  commentChanged: 'Comment updated successfully',
  cantRateSelf: "You can't rate your self",
  errors: {
    Expired: 'This session has expired',
    Pending: 'This session has not started yet',
    Closed: 'This session has been closed'
  },
  noTopics: 'There are no topics added'
};

module.exports = {
  messages: MESSAGES,
  chatRoomUrl: chatRoomUrl,
  findSession: findSession,
  findAllSessions: findAllSessions,
  copySession: copySession,
  removeSession: removeSession,
  updateSessionMemberRating: updateSessionMemberRating,
  getAllSessionRatings: getAllSessionRatings,
  addShowStatus: addShowStatus,
  changeComment: changeComment,
  validateSession: validateSession,
  getSessionByInvite: getSessionByInvite
};

function isInviteSessionInvalid(resp) {
  if ( new Date().getTime() < new Date(resp.Session.startTime).getTime() ) return 'Sorry, the '+res.Session.name+' Session is not yet open. Please check the Start Date & Time on your Confirmation email, or contact the Facilitator';
  if ( res.Session.isFull) return 'Sorry, the available places for the '+res.Session.name+' Session have already been filled. The Facilitator will contact you ASAP';
  if ( !res.Session.active) return 'Sorry, the '+res.Session.name+' Session is now closed. For any queries, please contact the Facilitator';

  return null;
}

function getSessionByInvite(token) {
  var deferred = q.defer();
  if (!token) {
    deferred.reject('No invite @token has been provided');
  }

  Invite.find({where:{token:token}, include: [Session]}).then(function(resp) {
    let sessionError = isInviteSessionInvalid(resp);
    if (sessionError) {
      return deferred.reject(sessionError);
    }
    deferred.resolve(resp);
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

// Exports
function changeComment(id, comment, accountId) {
  let deferred = q.defer();

  SessionMember.find({
    where: { id: id },
    include: [{
      model: Session,
      where: { accountId: accountId }
    }]
  }).then(function(sessionMember) {
    if(sessionMember) {
      sessionMember.update({ comment: comment }).then(function() {
        deferred.resolve(simpleParams(null, MESSAGES.commentChanged));
      }, function(error) {
        deferred.reject(filters.errors(error));
      });
    }
    else {
      deferred.reject(MESSAGES.sessionMemberNotFound);
    }
  });

  return deferred.promise;
}

function findSession(sessionId, accountId, provider) {
  let deferred = q.defer();

  Session.find({
    where: {
      id: sessionId,
      accountId: accountId
    },
    include: [{
      model: SessionMember,
      attributes: VALID_ATTRIBUTES.sessionMember,
      required: false
    }]
  }).then(function(session) {
    if(session) {
      modifySessions(session, accountId, provider).then(function(result) {
        deferred.resolve(simpleParams(result));
      }, function(error) {
        deferred.reject(error);
      });
    }
    else {
      deferred.reject(MESSAGES.notFound);
    }
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
};

function findAllSessions(userId, domain, provider) {
  let deferred = q.defer();
  if(policy.hasAccess(domain.roles, ['accountManager', 'admin'])) {
    findAllSessionsAsManager(domain.id, provider).then(function(data) {
      deferred.resolve(data);
    }, function(error) {
      deferred.reject(error);
    });
  }
  else {
    findAllSessionsAsMember(userId, domain.id, provider).then(function(data) {
      deferred.resolve(data);
    }, function(error) {
      deferred.reject(error);
    });
  }

  return deferred.promise;
};

function getAllSessionRatings() {
  let deferred = q.defer();

  Account.findAll({
    attributes: ['id', 'name'],
    include: [{
      model: Session,
      attributes: ['id', 'name'],
      include: [{
        model: SessionMember,
        attributes: ['rating', 'role']
      }]
    }]
  }).then(function(accounts) {
    deferred.resolve(simpleParams(prepareAccountRatings(accounts)));
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

function prepareAccountRatings(accounts) {
  let ratings = [];

  _.map(accounts, function(account) {
    let object = { name: account.name, sessions: [], rating: 0 };

    _.map(account.Sessions, function(session) {
      let sObject = { name: session.name, rating: 0 };
      let length = 0;
      _.map(session.SessionMembers, function(member) {
        if(member.role != 'facilitator') {
          length++;
        }

        sObject.rating += member.rating;
      });
      sObject.rating /= (length || 1);

      object.rating += sObject.rating;
      object.sessions.push(sObject);
    });

    if(!_.isEmpty(object.sessions)) {
      object.rating /= object.sessions.length;
      ratings.push(object);
    }
  });

  return ratings;
};

function removeSession(sessionId, accountId, provider) {
  let deferred = q.defer();

    findSession(sessionId, accountId, provider).then(function(result) {
      result.data.destroy().then(function() {
        deferred.resolve(simpleParams(null, MESSAGES.removed));
      }).catch(function(error) {
        deferred.reject(filters.errors(error));
      });
    }, function(error) {
      deferred.reject(error);
    });

  return deferred.promise;
};

function copySessionTopics(accountId, fromSessionId, toSessionId) {
  let deferred = q.defer();
  topicsService.getAll(accountId).then(function(allTopics) {
    let topicsArray = [];
    allTopics.map(function(topic) {
      topic.SessionTopics.map(function(topicItem) {

        if (fromSessionId == topicItem.sessionId) {
          topic.accountId = accountId;
          topic.order = topicItem.order;
          topicsArray.push(topic);
        }
      });
    });

    topicsService.updateSessionTopics(toSessionId, topicsArray).then(function(successResponse) {
      deferred.resolve(successResponse);
    }, function(failureResponse) {
      deferred.reject(failureResponse);
    });
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function copySession(sessionId, accountId, provider) {
  let deferred = q.defer();

  validators.hasValidSubscription(accountId).then(function() {
    validators.subscription(accountId, 'session', 1).then(function() {
      findSession(sessionId, accountId, provider).then(function(result) {
        let facilitator = result.data.dataValues.facilitator;
        delete result.data.dataValues.id;
        delete result.data.dataValues.facilitator;
        result.data.dataValues.step = "setUp";
        Session.create(result.data.dataValues).then(function(session) {
          async.waterfall([
              function (callback) {
                copySessionTopics(accountId, sessionId, session.id).then(function(successResponse) {
                  callback();
                }, function(errorResponse) {
                  //we ignore error because data is copied step by step, and one error shouldn't stop following copying
                  callback();
                });
              },
              function (callback) {
                //copying facilitator
                if(facilitator) {
                  delete facilitator.id;
                  delete facilitator.token;
                  copySessionMember(session, facilitator, provider).then(function() {
                    callback();
                  }, function(error) {
                    callback();
                  });
                } else {
                  callback();
                }
              },
              function(callback) {
                MailTemplateService.copyTemplatesFromSession(accountId, sessionId, session.id, function(error, result) {
                  callback();
                });
              }
          ], function (error) {
            //we ignore error in callback because data is copied step by step, and one error shouldn't stop following copying
            prepareModifiedSessions(session, accountId, provider, deferred);
          });
        }).catch(function(error) {
          deferred.reject(filters.errors(error));
        });
      }, function(error) {
        deferred.reject(error);
      });
    }, function(error) {
      deferred.reject(error);
    })
  }, function(error) {
    deferred.reject(error);
  })

  return deferred.promise;
};

function prepareModifiedSessions(session, accountId, provider, deferred) {
  findSession(session.id, session.accountId, provider).then(function(result) {
    modifySessions(result.data, accountId, provider).then(function(result) {
      deferred.resolve(simpleParams(result, MESSAGES.copied));
    }, function(error) {
      deferred.reject(error);
    });
  }, function(error) {
    deferred.reject(error);
  });
}

function chatRoomUrl() {
  return '/chat/';
};

function updateSessionMemberRating(params, userId, accountId) {
  let deferred = q.defer();
  validators.hasValidSubscription(accountId).then(function() {
    SessionMember.find({
      where: {
        id: params.id
      },
      attributes: VALID_ATTRIBUTES.sessionMember,
      returning: true
    }).then(function(member) {
      if(member) {
        AccountUser.find({
          where: {
            id: member.accountUserId,
            UserId: userId,
            AccountId: accountId
          }
        }).then(function(accountUser) {
          if(accountUser) {
            deferred.reject(MESSAGES.cantRateSelf);
          }
          else {
            member.update({ rating: params.rating }, { returning: true }).then(function(sessionMember) {
              deferred.resolve(simpleParams(member, MESSAGES.rated));
            }).catch(function(error) {
              deferred.reject(filters.errors(error));
            });
          }
        });
      }
      else {
        deferred.reject(MESSAGES.sessionMemberNotFound);
      }
    }).catch(function(error) {
      deferred.reject(filters.errors(error));
    });
  }, function(error) {
    deferred.reject(error);
  })

  return deferred.promise;
};

// Helpers
function findFacilitator(members) {
  let facilitator = {};
  _.map(members, function(member, index) {
    if(member.role == 'facilitator') {
      return facilitator = member;
    }
  });

  return facilitator.dataValues;
}

function findAllSessionsAsManager(accountId, provider) {
  let deferred = q.defer();
  Session.findAll({
    where: {
      accountId: accountId
    },
    include: [{
      model: SessionMember,
      attributes: VALID_ATTRIBUTES.sessionMember,
      required: false,
      include: [{
        model: AccountUser,
        attributes: ['firstName', 'lastName', 'email']
      }]
    }]
  }).then(function(sessions) {
    modifySessions(sessions, accountId, provider).then(function(result) {
      deferred.resolve(simpleParams(result));
    }, function(error) {
      deferred.reject(error);
    });
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
};

function findAllSessionsAsMember(userId, accountId, provider) {
  let deferred = q.defer();
  Session.findAll({
    where: {
      accountId: accountId
    },
    include: [{
      model: SessionMember,
      attributes: VALID_ATTRIBUTES.sessionMember,
      include: [{
        model: AccountUser,
        where: {
          UserId: userId,
          AccountId: accountId
        }
      }]
    }]
  }).then(function(sessions) {
    modifySessions(sessions, accountId, provider).then(function(result) {
      deferred.resolve(simpleParams(result));
    }, function(error) {
      deferred.reject(error);
    });
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
};

function copySessionMember(session, facilitator, provider) {
  let deferred = q.defer();
  facilitator.sessionId = session.id;
  sessionMemberServices.createWithTokenAndColour(facilitator).then(function(sessionMember) {
     deferred.resolve();
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function simpleParams(data, message) {
  return { data: data, message: message };
};

function modifySessions(sessions, accountId, provider) {
  let deferred = q.defer();

  models.Account.find({ where: { id: accountId } }).then(function(account) {
    if(account.admin) {
      changeSessionData(sessions, null, provider);
      deferred.resolve(sessions);
    }
    else {
      models.Subscription.find({ where: { accountId: accountId } }).then(function(subscription) {
        subscriptionService.getChargebeeSubscription(subscription.subscriptionId, provider).then(function(chargebeeSub) {
          changeSessionData(sessions, chargebeeSub, provider);
          deferred.resolve(sessions);
        }, function(error) {
          deferred.reject(error);
        })
      }).catch(function(error) {
        deferred.reject(filters.errors(error));
      });
    }
  })


  return deferred.promise;
}

function changeSessionData(sessions, chargebeeSub, provider) {
  let array = _.isArray(sessions) ? sessions : [sessions];
  _.map(array, function(session) {
    if(chargebeeSub) {
      addShowStatus(session, chargebeeSub);
    }
    else {
      session.dataValues.showStatus = 'Indefinite';
    }

    let facilitator = findFacilitator(session.SessionMembers);
    if(facilitator) {
      let facIndex;

      session.dataValues.facilitator = facilitator;
      let total = 0;
      _.map(session.SessionMembers, function(member, index) {
        if(member.id == facilitator.id) {
          facIndex = index;
        }
        else {
          total += member.rating;
        }
      });
      session.SessionMembers.splice(facIndex, 1);
      session.dataValues.averageRating = total / session.SessionMembers.length;
    }
  });
}

// function functionName() {
//   let order = ['accountManager', 'facilitator', 'participant', 'observer'];
//   models.AccountUser.findAll({
//     where: { UserId: userId },
//     include: [{
//       model: models.Account,
//       include: [{
//         model: models.Session,
//         where: { id: sessionId }
//       }]
//     }]
//   }).then(function(accountUsers) {
//     console.log(accountUsers);
//   });
// }

function validateSession(sessionId, provider) {
  let deferred = q.defer();

  async.waterfall([
    function(cb) { validateDates(sessionId, provider, cb); },
    function(cb) { validateTopics(sessionId, cb); }
  ], function(error) {
    if(error) {
      deferred.reject(error);
    }
    else {
      deferred.resolve();
    }
  });

  return deferred.promise;
}

function validateDates(sessionId, provider, cb) {
  models.Session.find({
    where: { id: sessionId },
    include: [{
      model: Account,
      include: [models.Subscription]
    }]
  }).then(function(session) {
    console.log(sessionId);
    subscriptionService.getChargebeeSubscription(session.Account.Subscription.subscriptionId, provider).then(function(chargebeeSub) {
      addShowStatus(session, chargebeeSub);
      let error = MESSAGES.errors[session.dataValues.showStatus];

      if(error) {
        cb(error);
      }
      else {
        cb();
      }
    }, function(error) {
      cb(error);
    });
  }).catch(function(error) {
    cb(filters.errors(error));
  });
}

function validateTopics(sessionId, cb) {
  models.SessionTopics.count({ where: { sessionId: sessionId } }).then(function(count) {
    if(count > 0) {
      cb()
    }
    else {
      cb(MESSAGES.noTopics);
    }
  });
}

function addShowStatus(session, chargebeeSub) {
  let endDate = new Date((chargebeeSub.current_term_end || chargebeeSub.trial_end) * 1000);
  let settings = session.dataValues || session;
  settings.expireDate = endDate;

  if(session.active) {
    var date = new Date();
    if(chargebeeSub && (date > endDate || date > new Date(session.endTime))) {
      settings.showStatus = 'Expired';
    }
    else if(date < new Date(session.startTime)) {
      settings.showStatus = 'Pending';
    }
    else {
      settings.showStatus = 'Open';
    }
  }
  else {
    settings.showStatus = 'Closed';
  }
}
