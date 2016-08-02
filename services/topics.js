'use strict';
let q = require('q');
var validators = require('./../services/validators');
var filters = require('./../models/filters');
var models = require('./../models');
var Topic = models.Topic;
var _ = require('lodash');
var Session = models.Session;

const MESSAGES = {
  updatedSessionTopic: "Session Topic was successfully update.",
  error: { isRelaitedSession: "Can't delete topic is related session" }
};

module.exports = {
  getAll: getAll,
  create: create,
  update: update,
  updateSessionTopicName: updateSessionTopicName,
  destroy: destroy,
  updateSessionTopics: updateSessionTopics,
  joinToSession: joinToSession,
  removeFromSession: removeFromSession,
  removeAllFromSession: removeAllFromSession,
  removeAllAndAddNew: removeAllAndAddNew,
  MESSAGES: MESSAGES
};

function getAll(accountId) {
  let deferred = q.defer();
  Topic.findAll({
    where: {
      accountId: accountId
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

function updateSessionTopicName(params) {
  let deferred = q.defer();

  models.SessionTopics.update({ name: params.sessionTopicName, boardMessage: params.boardMessage }, {
    where: {
      id: params.sessionTopicId
    }
  }).then(function() {
    models.SessionTopics.find({
      where: {
        id: params.sessionTopicId
      }
    }).then(function(result) {
      deferred.resolve({ sessionTopic: result, message: MESSAGES.updatedSessionTopic });
    })
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function updateSessionTopics(sessionId, topicsArray) {
  let deferred = q.defer();
  let ids = _.map(topicsArray, 'id');
  let returning = [];
  joinToSession(ids, sessionId, topicsArray).then(function(sessionTopics) {

    _.map(sessionTopics, function(sessionTopic) {
      _.map(topicsArray, function(topic) {
        if(topic.id == sessionTopic.topicId) {
          sessionTopic.order = topic.order;
          sessionTopic.active = topic.active;

          if(!sessionTopic.name) {
            sessionTopic.name = topic.name;
          }

          if(!sessionTopic.boardMessage) {
            sessionTopic.boardMessage = "Say something nice if you wish!";
          }

          sessionTopic.update({
            order: sessionTopic.order,
            active: sessionTopic.active,
            name: sessionTopic.name,
            boardMessage: sessionTopic.boardMessage
          });

          topic.SessionTopics = [sessionTopic];
          returning.push(topic);
        }
      });
    });

    deferred.resolve(returning);
  }, function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function joinToSession(ids, sessionId) {
  let deferred = q.defer();
  Session.find({where: { id: sessionId } }).then(function(session) {
    Topic.findAll({where: {id: ids}}).then(function(results) {
      session.addTopics(results).then(function(result) {
        models.SessionTopics.findAll({
          where: {
            sessionId: sessionId
          },
          order: '"order" ASC',
          include: [Topic]
        }).then( function(sessionTopics) {
          deferred.resolve(sessionTopics);
        });

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

function removeFromSession(ids, sessionId) {
  let deferred = q.defer();
  Session.find({where: { id: sessionId } }).then(function(session) {
    Topic.findAll({where: {id: ids}}).then(function(results) {
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
      where: { id: sessionId }
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

function destroy(id) {
  let deferred = q.defer();
  Topic.find({where: { id: id }, include: [{model: models.Session }]}).then(function(topic) {
    if (_.isEmpty(topic.Sessions)) {
      Topic.destroy({where: { id: id } }).then(function(result) {
        deferred.resolve(result)
      },function(error) {
        deferred.reject(filters.errors(error));
      })
    } else {
      deferred.reject(MESSAGES.error.isRelaitedSession);
    }
  });
  return deferred.promise;
}

function create(params) {
  let deferred = q.defer();

  validators.subscription(params.accountId, 'topic', 1).then(function() {
    Topic.create(params).then(function(topic) {
      deferred.resolve(topic);
    },function(error) {
      deferred.reject(filters.errors(error));
    });
  },function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function update(params) {
  let deferred = q.defer();
  let id = params.id;

  delete params.id;
  models.sequelize.transaction().then(function(t) {
    Topic.update(params, {
      where:{id: id}
    }, {transaction: t}).then(function(topic) {
      delete params.name
      models.SessionTopics.update(params, {
        where:{topicId: id}
      }, {transaction: t}).then(function(sessionTopic) {
        t.commit().then(function() {
          deferred.resolve(sessionTopic);
        });
      },function(error) {
        t.rollback().then(function() {
          deferred.reject(filters.errors(error));
        });
      });

    },function(error) {
      t.rollback().then(function() {
        deferred.reject(filters.errors(error));
      });
    });
  });

  return deferred.promise;
}
