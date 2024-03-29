'use strict';

var MessagesUtil = require('./../util/messages');
let q = require('q');
var validators = require('./../services/validators/subscription');
var filters = require('./../models/filters');
var models = require('./../models');
var sessionBuilderSnapshotValidation = require('./sessionBuilderSnapshotValidation');
var sessionTypesConstants = require('./../util/sessionTypesConstants');
var Topic = models.Topic;
var _ = require('lodash');
let Bluebird = require('bluebird')
var Session = models.Session;

module.exports = {
  getAll: getAll,
  create: create,
  update: update,
  updateSessionTopic: updateSessionTopic,
  destroy: destroy,
  updateSessionTopics: updateSessionTopics,
  joinToSession: joinToSession,
  removeFromSession: removeFromSession,
  removeAllFromSession: removeAllFromSession,
  removeAllAndAddNew: removeAllAndAddNew,
  canChangeTopicActive: canChangeTopicActive,
  messages: MessagesUtil.topics,
  createDefaultForAccount: createDefaultForAccount,
  updateDefaultTopic: updateDefaultTopic
};

function getAll(accountId, sessionType) {
  return new Bluebird((resolve, reject) => {
    let includeInviteAgainTopic = !sessionType || sessionTypesConstants[sessionType].features.inviteAgainTopic.enabled;
    let where = includeInviteAgainTopic ?
      { $or: [{ accountId: accountId }, { stock: true }] } :
      { $or: [{ accountId: accountId }, { stock: true }], inviteAgain : false };

    Topic.findAll({
      order: '"name" ASC',
      where: where,
      include: [{
        model: models.SessionTopics,
        include: [{
          model: models.Session,
          where: { accountId },
          required: false
        }]
      }]
    }).then(function(results) {
      _.each(results, (topic) => {
        if(topic.stock) {
          topic.dataValues.SessionTopics = topic.SessionTopics.filter((sessionTopic) => sessionTopic.Session && sessionTopic.Session.accountId === accountId);
        }
      });

      if (sessionType && includeInviteAgainTopic) {
        validators.validate(accountId, 'contactList', 1).then(function(topic) {
          resolve({ topics: results });
        }, function() {
          resolve({ topics: results, message: MessagesUtil.session.contactListLimit });
        });
      } else {
        resolve({ topics: results });
      }
    }, function(error) {
      reject(filters.errors(error));
    });
  });
}

function updateDefaultTopic(params, isAdmin) {
  let topicId = getTopicId(params);
  let topicParams = getTopicParams(params, topicId);
  let newSessionTopic;
  return new Bluebird((resolve, reject) => {
    update(topicParams, isAdmin).then((topic) => {
      models.SessionTopics.findAll({where: {topicId: topicId}}).then((sessionTopics) => {
        Bluebird.each(sessionTopics, (sessionTopic) => {
          if (params.snapshot && params.sessionId == sessionTopic.sessionId) {
             return updateSessionTopic(params).then((updateSessionTopic) => {
              newSessionTopic = updateSessionTopic;
             });
          } else {
            let sessionTopicsParams = {
              boardMessage: params.boardMessage,
              name: params.name,
              sign: params.sign
            };

            return sessionTopic.update(sessionTopicsParams);
          }
        }).then((updatedSessionTopics) => {
          if (newSessionTopic) {
            resolve(newSessionTopic);
          } else {
            resolve(topic);
          }
        }, (error) => {
          reject(error);
        });
      }, (error) => {
        reject(filters.errors(error));
      });
    }, (error) => {
      reject(error);
    });
  });
}

function getTopicId(params) {
  return params.isCurrentSessionTopic ? params.topicId : params.id;
}

function getTopicParams(params, topicId) {
  if(params.isCurrentSessionTopic) {
    return {
      id: topicId,
      boardMessage: params.boardMessage,
      name: params.name,
      sign: params.sign
    };
  }

  return params;
}

function updateSessionTopic(params) {
  let deferred = q.defer();
  let snapshot = params.snapshot;
  delete params.snapshot;

  models.SessionTopics.find({ where: { id: params.id } }).then(function(sessionTopic) {
    if (sessionTopic) {
      let validParams = sessionTopicUpdateParams(params);

      let validationRes = sessionBuilderSnapshotValidation.isTopicDataValid(snapshot, validParams, sessionTopic);
      if (validationRes.isValid) {
        sessionTopic.update(validParams, { returning: true }).then(function(res){
          deferred.resolve({ sessionTopic: res, message: MessagesUtil.topics.updatedSessionTopic });
        }, function(error) {
          deferred.reject(filters.errors(error));
        });
      } else {
        deferred.resolve({ validation: validationRes });
      }

    } else {
      deferred.reject(MessagesUtil.topics.error.notFound);
    }
  }, function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function checkInviteAgainTopic(sessionTopic, length, arrayLength) {
  return new Bluebird(function (resolve, reject) {
    if (sessionTopic.Topic.inviteAgain && arrayLength < length) {
      return sessionTopic.update({order: length}).then(() => {
        sessionTopic.order = length;
        resolve();
      }, (error) => {
        reject(error);
      });
    } else {
      resolve();
    }
  });
}

function updateSessionTopics(sessionId, topicsArray) {
  return new Bluebird(function (resolve, reject) {
    let ids = _.map(topicsArray, 'id');
    let returning = [];
    joinToSession(ids, sessionId).then(function(result) {
      Bluebird.each(result.sessionTopics, (sessionTopic) => {

        return new Bluebird(function (resolveInternal, rejectInternal) {
          let inviteAgainTopicUpdated = false;
          checkInviteAgainTopic(sessionTopic, result.sessionTopics.length, topicsArray.length).then(function() {
            Bluebird.each(topicsArray, (topic) => {

              if (topic.id == sessionTopic.topicId) {
                if (sessionTopic.Topic.inviteAgain) {
                  inviteAgainTopicUpdated = true;
                }
                let params = {
                  order: sessionTopic.Topic.inviteAgain ? result.sessionTopics.length : topic.sessionTopic.order,
                  active: topic.sessionTopic.active,
                  landing: topic.sessionTopic.landing,
                  name: topic.sessionTopic.name,
                  boardMessage: topic.sessionTopic.boardMessage,
                  sign: topic.sessionTopic.sign,
                  lastSign: topic.sessionTopic.lastSign,
                }
                return sessionTopic.update(params).then(() =>{
                  topic.SessionTopics = [sessionTopic];
                  returning.push(topic);
                });
              }

            }).then(function() {
              if (!inviteAgainTopicUpdated && sessionTopic.Topic.inviteAgain) {
                let inviteAgainTopic = Object.assign({}, sessionTopic.Topic.dataValues);
                inviteAgainTopic.SessionTopics = [sessionTopic];
                returning.push(inviteAgainTopic);
              }
              resolveInternal();
            }, function(error) {
              rejectInternal(error);
            });
          }, function(error) {
            rejectInternal(error);
          });
        });

      }).then(function() {
        let message = null;
        if (result.skipedStock) {
          message = MessagesUtil.sessionBuilder.errors.secondStep.stock;
        } else if (result.skipedInviteAgain) {
          message = MessagesUtil.session.contactListLimit;
        }
        resolve({ data: returning, message: message });
      }, function(error) {
        reject(filters.errors(error));
      });
    }, function(error) {
      reject(filters.errors(error));
    });
  });
}

function joinToSession(ids, sessionId) {
  let deferred = q.defer();
  Session.find({ where: { id: sessionId } }).then(function(session) {
    canAddInviteAgainTopic(session.accountId).then(function(canAddInviteAgain) {
      let where = canAddInviteAgain ? { id: ids, stock: false } : { id: ids, stock: false, inviteAgain: false };
      Topic.findAll({ where: where }).then(function(results) {
        session.addTopics(results).then(function(result) {
          models.SessionTopics.findAll({
            where: {
              sessionId: sessionId
            },
            order: '"order" ASC',
            include: [Topic]
          }).then( function(sessionTopics) {
            let skiped = results.length < ids.length;
            skipedStock(ids, skiped).then(function(skipedStockTopics) {
              deferred.resolve({
                sessionTopics: sessionTopics,
                skipedStock: skipedStockTopics && sessionTopics.length != ids.length,
                skipedInviteAgain: skiped && !skipedStockTopics,
                session
              });
            }, function() {
              deferred.reject(filters.errors(error));
            });
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
  });

  return deferred.promise;

  function skipedStock(ids, skiped) {
    return new Bluebird(function (resolve, reject) {
      if (skiped) {
        Topic.count({ where: { id: ids, stock: true } }).then(function(c) {
          resolve(c > 0);
        }, function() {
          reject();
        });
      } else {
        resolve(false);
      }
    });
  }

  function canAddInviteAgainTopic(accountId) {
    return new Bluebird(function (resolve, reject) {
      validators.validate(accountId, 'contactList', 1).then(function(topic) {
        resolve(true);
      }, function() {
        resolve(false);
      });
    });
  }
}

function removeFromSession(ids, sessionId) {
  let deferred = q.defer();
  Session.find({where: { id: sessionId } }).then(function(session) {
    Topic.findAll({where: {id: ids, default: false}}).then(function(results) {
      session.removeTopics(results).then(function(result) {
        deferred.resolve(result);
      }, function(error) {
        deferred.reject(filters.errors(error));
      })
    }, function(error) {
      deferred.reject(filters.errors(error));
    })
  }, function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function removeAllFromSession(sessionId) {
  let deferred = q.defer();

  Topic.findAll({
    include: [{
      model: models.Session,
      where: { id: sessionId, default: false }
    }]
  }).then(function(results) {
    let ids = _.map(results, 'id');
    models.SessionTopics.destroy({ where: { sessionId: sessionId, topicId: { $in: ids }  } } ).then(function(result) {
      deferred.resolve(result);
    }, function(error) {
      deferred.reject(filters.errors(error));
    });
  }, function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function canChangeTopicActive(accountId, sessionId) {
  return validators.getTopicCount(accountId, { sessionId });
}

function removeAllAndAddNew(accountId, sessionId, topics) {
  let deferred = q.defer();
  let data;

  updateSessionTopics(sessionId, topics).then(function(result) {
    data = result;
    return canChangeTopicActive(accountId, sessionId);
  }).then((validation) => {
    if(validation.count > validation.limit && validation.limit !== -1) {
      let query = {
        where: { sessionId, '$Topic.default$': false, '$Topic.inviteAgain$': false },
        limit: validation.count - validation.limit,
        order: '"updatedAt" DESC',
        include: [{ model: Topic }],
      };
      models.SessionTopics.findAll(query).then((result) => {
        const ids = _.map(result, 'id');
        return models.SessionTopics.update({ active: false }, { where: { id: ids } });
      }).then(() => {
        return models.Topic.findAll({
          order: '"SessionTopics.order" ASC, "SessionTopics.topicId" ASC',
          include: [{
            model: models.SessionTopics,
            where: { sessionId }
          }]
        })
      }).then((result) => {
        deferred.resolve({ data: result });
      }).catch((error) => {
        deferred.reject(error);
      });
    }
    else {
      deferred.resolve(data);
    }
  }).catch((error) => {
    deferred.reject(error);
  });

  return deferred.promise;
}

function destroy(id, isAdmin) {
  let deferred = q.defer();
  Topic.find({where: { id: id }, include: [{model: models.Session }]}).then(function(topic) {
    if (topic.default) {
      deferred.reject(MessagesUtil.topics.error.default);
    } else if (topic.stock && topic.inviteAgain) {
      deferred.reject(MessagesUtil.topics.error.inviteAgain);
    } else if (topic.stock && !isAdmin) {
      deferred.reject(MessagesUtil.topics.error.stock);
    } else if (_.isEmpty(topic.Sessions)) {
      Topic.destroy({where: { id: id } }).then(function(result) {
        deferred.resolve(result)
      },function(error) {
        deferred.reject(filters.errors(error));
      })
    } else {
      deferred.reject(MessagesUtil.topics.error.relatedSession);
    }
  });
  return deferred.promise;
}

function create(params, isAdmin) {
  let deferred = q.defer();

  if (!isAdmin && params.stock) {
    params.stock = false;
  }

  Topic.create(params).then(function(topic) {
    deferred.resolve(topic);
  },function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function update(params, isAdmin) {
  return new Bluebird((resolve, reject) => {
    Topic.find({ where: { id: params.id } }).then((topic) => {
      if (topic) {
        if(topic.stock){
          resolve(updateStockTopic(topic, params, isAdmin));
        }else{
          resolve(updateRegularTopic(topic, params, isAdmin));
        }
      } else {
        reject(MessagesUtil.topics.error.notFound);
      }
    }).then((topic) => {
      resolve(topic);
    }).catch((error) => {
      reject(filters.errors(error));
    });
  });
}

function updateStockTopic(topic, params, isAdmin){
  return new Bluebird((resolve, reject) => {
     if(params.sessionId){
       if (params.name == topic.name) {
            params.parentTopicId = topic.id;
          }
        delete params.id;
        resolve(create(params))
     }else{
       if(isAdmin){
        simpleUpdate(topic, params, resolve, reject);
       }else{
          if (params.name == topic.name) {
            params.parentTopicId = topic.id;
          }
          delete params.id;
          resolve(create(params))
       }
     }
  })
}
function updateRegularTopic(topic, params, isAdmin){
  return new Bluebird((resolve, reject) => {
      simpleUpdate(topic, params, resolve, reject);
  })
}

function simpleUpdate(topic, params, resolve, reject) {
  topic.update(params, { returning: true })
    .then((topic) => resolve(topic))
    .catch((error) => reject(filters.errors(error)))
}

function sessionTopicUpdateParams(params) {
  return _.pick(params, ['boardMessage', 'sign', 'lastSign', 'name']);
}

function createDefaultForAccount(params, transaction) {
  return new Bluebird((resolve, reject) => {
    params["default"] = true;
    Topic.create(params, { transaction: transaction }).then(function(topic) {
      resolve(topic);
    },function(error) {
      reject(filters.errors(error));
    });
  });
}
