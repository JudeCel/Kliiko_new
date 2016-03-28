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
  joinToSession(ids, sessionId, topicsArray).then(function(sessionTopics) {
  /*
    _.map(sessionTopics, function(sessionTopic) {
      _.map(topicsArray, function(topic) {
        if(topic.id == sessionTopic.TopicId) {

          if (topic.active) sessionTopic.active = topic.active;
          else  sessionTopic.active = false;
          if (topic.order)  sessionTopic.order = topic.order;
          else sessionTopic.order = 0;
          //any field update this way makes extra copy in database
          try {
            sessionTopic.update({}).then(function(res) {
            }).catch(function(err){

            });
          } catch (err) {
          }
        }
      });
    });
*/
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
        deferred.resolve(result[0]);
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
    models.SessionTopics.destroy({ where: { SessionId: sessionId, TopicId: { $in: ids }  } } ).then(function(result) {
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
  let id = params.id;

  delete params.id;
  models.sequelize.transaction().then(function(t) {
    Topic.update(params, {
      where:{id: id}
    }, {transaction: t}).then(function(topic) {
      models.SessionTopics.update(params, {
        where:{TopicId: id}
      }, {transaction: t}).then(function(sessionTopic) {
        t.commit().then(function() {
          deferred.resolve(sessionTopic);
        });
      },function(err) {
        t.rollback().then(function() {
          deferred.reject(err);
        });
      });

    },function(err) {
      t.rollback().then(function() {
        deferred.reject(err);
      });
    });
  });

  return deferred.promise;
}
