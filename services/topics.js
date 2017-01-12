'use strict';

var MessagesUtil = require('./../util/messages');
let q = require('q');
var validators = require('./../services/validators');
var filters = require('./../models/filters');
var models = require('./../models');
var sessionBuilderSnapshotValidation = require('./sessionBuilderSnapshotValidation');
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
  messages: MessagesUtil.topics,
  createDefaultForAccount: createDefaultForAccount
};

function getAll(accountId) {
  let deferred = q.defer();
  Topic.findAll({
    order: '"name" ASC',
    where: {
      $or: [{ 
        accountId: accountId
      }, {
        stock: true
      }]
    },
    include: [{
      model: models.SessionTopics,
      include: [{
        model: models.Session
      }]
    }]
  }).then(function(results){
    deferred.resolve(results);
  }, function(error) {
    deferred.reject(filters.errors(error));
  });
  return deferred.promise;
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
      deferred.reject(MessagesUtil.topics.notFoundSessionTopic);
    }
  }, function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function updateSessionTopics(sessionId, topicsArray) {
  return new Bluebird(function (resolve, reject) {
    let ids = _.map(topicsArray, 'id');
    let returning = [];
    joinToSession(ids, sessionId, topicsArray).then(function(result) {
      Bluebird.each(result.sessionTopics, (sessionTopic) => {

        return new Bluebird(function (resolveInternal, rejectInternal) {
          Bluebird.each(topicsArray, (topic) => {

            if (topic.id == sessionTopic.topicId) {
              let params = {
                order: topic.sessionTopic.order,
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
            resolveInternal();
          }, function(error) {
            rejectInternal(error);
          });
        });

      }).then(function() {
        resolve({ data: returning, message: result.skipedStock ? MessagesUtil.sessionBuilder.errors.secondStep.stock : null });
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
  Session.find({where: { id: sessionId } }).then(function(session) {
    Topic.findAll({where: {id: ids, stock: false}}).then(function(results) {
      session.addTopics(results).then(function(result) {
        models.SessionTopics.findAll({
          where: {
            sessionId: sessionId
          },
          order: '"order" ASC',
          include: [Topic]
        }).then( function(sessionTopics) {
          deferred.resolve({sessionTopics: sessionTopics, skipedStock: results.length < ids.length});
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

  return deferred.promise;
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

function removeAllAndAddNew(sessionId, topics) {
  let deferred = q.defer();

  updateSessionTopics(sessionId, topics).then(function(result) {
    deferred.resolve(result);
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function destroy(id, isAdmin) {
  let deferred = q.defer();
  Topic.find({where: { id: id }, include: [{model: models.Session }]}).then(function(topic) {
    if (topic.default) {
      deferred.reject(MessagesUtil.topics.error.default);
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

  validators.subscription(params.accountId, 'topic', 1).then(function() {
    Topic.create(params).then(function(topic) {
      deferred.resolve(topic);
    },function(error) {
      deferred.reject(error);
    });
  },function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function update(params) {
  let deferred = q.defer();

  Topic.find({ where: { id: params.id } }).then(function(topic) {
    if (topic) {
      if (topic.stock) {
        if (params.name == topic.name) {
          params.name = "Copy of " + topic.name;
        }
        delete params.id;
        return create(params);
      } else {
        return topic.update(params, { returning: true });
      }
    } else {
      deferred.reject(MessagesUtil.topics.notFound);
    }
  }).then(function(topic) {
    deferred.resolve(topic);
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function sessionTopicUpdateParams(params) {
  return _.pick(params, ['boardMessage', 'sign', 'lastSign']);
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
