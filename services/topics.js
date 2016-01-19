'use strict';
let q = require('q');
var models = require('./../models');
var Topic = models.Topic;
var _ = require('lodash');
var Session = models.Session;
const MESSAGES = {error: { isRelaitedSession: "Can't delete topic is related session" } }

module.exports = {
  getAll: getAll,
  create: create,
  destroy: destroy,
  joninSession: joninSession,
  removeSession: removeSession
};

function getAll(accountId) {
  let deferred = q.defer();
  Topic.findAll({where: { accountId: accountId }, include: [{ model: models.Session }] }).then(function(results){
    deferred.resolve(results);
  },function(err) {
    deferred.reject(err);
  })
  return deferred.promise;
}

function joninSession(id, sessionId) {
  let deferred = q.defer();
  Topic.find({where: { id: id}}).then(function(topic) {
    Session.find({where: { id: sessionId } }).then(function(session) {
      topic.addSession([session]).then(function(result) {
        deferred.resolve(true);
      }, function(err) {
        console.log(err);
        deferred.reject(err);
      })
    }, function(err) {
      deferred.reject(err);
    })
  }, function(err) {
    deferred.reject(err);
  })
  return deferred.promise;
}

function removeSession(topicId, sessionId) {
  let deferred = q.defer();

  Topic.find({where: { id: topicId}}).then(function(topic) {
    Session.find({where: {id: sessionId} }).then(function(session) {
      topic.removeSession(session).then(function(result) {
        deferred.resolve(result);
      }, function(err) {
        deferred.reject(err);
      })
    }, function(err) {
      deferred.reject(err);
    })
  }, function(err) {
    deferred.reject(err);
  })
  return deferred.promise;
}

function destroy(id) {
  let deferred = q.defer();
  Topic.find({where: { id: id }, include: [{model: models.Session }]}).then(function(topic) {
    if (_.isEmpty(topic.Sessions)) {
      Topic.destroy({where: { id: topicId}}).then(function(result) {
        console.log();
        deferred.resolve(result)
      },function(err) {
        deferred.reject(err);
      })
    }else{
      deferred.reject(MESSAGES.error.isRelaitedSession);
    }
  })
  return deferred.promise;
}

function create(params) {
  let deferred = q.defer();
  Topic.create(params).then(function(topic) {
    deferred.resolve(topic);
  },function(err) {
    deferred.reject(err);
  })
  return deferred.promise;
}
