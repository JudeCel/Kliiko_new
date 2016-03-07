'use strict';
let q = require('q');
var models = require('./../models');
var Topic = models.Topic;
var _ = require('lodash');
var Session = models.Session;
const MESSAGES = {error: { isRelaitedSession: "Can't delete topic is related session" } };

module.exports = {
  getAll: getAll,
  create: create,
  update: update,
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
  Topic.findAll({where: { accountId: accountId }, include: [{ model: models.Session }] }).then(function(results){
    deferred.resolve(results);
  },function(err) {
    deferred.reject(err);
  });
  return deferred.promise;
}

function updateSessionTopics(sessionId, topicsArray) {
  let deferred = q.defer();

  let ids = _.map(topicsArray, 'id');
  joinToSession(ids, sessionId).then(function(sessionTopics) {
    _.map(sessionTopics, function(sessionTopic) {
      _.map(topicsArray, function(topic) {
        if(topic.id == sessionTopic.TopicId) {
          sessionTopic.order = topic.order;
          sessionTopic.active = topic.active;
          sessionTopic.update();
        }
      });
    });

    deferred.resolve(sessionTopics);
  }, function(err) {
    deferred.reject(err);
  });

  return deferred.promise;
}

function joinToSession(ids, sessionId) {
  let deferred = q.defer();
  Session.find({where: { id: sessionId } }).then(function(session) {
    Topic.findAll({where: {id: ids}}).then(function(results) {
      session.addTopics(results).then(function(result) {
        deferred.resolve(result);
      }, function(err) {
        deferred.reject(err);
      })
    }, function(err) {
      deferred.reject(err);
    })
  }, function(err) {
    deferred.reject(err);
  });

  return deferred.promise;
}

function removeFromSession(ids, sessionId) {
  let deferred = q.defer();
  Session.find({where: { id: sessionId } }).then(function(session) {
    Topic.findAll({where: {id: ids}}).then(function(results) {
      session.removeTopics(results).then(function(result) {
        deferred.resolve(result);
      }, function(err) {
        deferred.reject(err);
      })
    }, function(err) {
      deferred.reject(err);
    })
  }, function(err) {
    deferred.reject(err);
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
    removeFromSession(ids, sessionId).then(function(result) {
      deferred.resolve(result);
    }, function(err) {
      deferred.reject(err);
    });
  }, function(err) {
    deferred.reject(err);
  });

  return deferred.promise;
}

function removeAllAndAddNew(sessionId, topics) {
  let deferred = q.defer();

  removeAllFromSession(sessionId).then(function() {
    updateSessionTopics(sessionId, topics).then(function(result) {
      deferred.resolve(result);
    }, function(error) {
      deferred.reject(error);
    });
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
      },function(err) {
        deferred.reject(err);
      })
    } else {
      deferred.reject(MESSAGES.error.isRelaitedSession);
    }
  });
  return deferred.promise;
}

function create(params) {
  let deferred = q.defer();
  Topic.create(params).then(function(topic) {
    deferred.resolve(topic);
  },function(err) {
    deferred.reject(err);
  });
  return deferred.promise;
}

function update(params) {
  let deferred = q.defer();
  Topic.update(params,{ where:{id: params.id}} ).then(function(topic) {
    deferred.resolve(topic);
  },function(err) {
    deferred.reject(err);
  });
  return deferred.promise;
}
