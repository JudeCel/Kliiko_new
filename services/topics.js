'use strict';
let q = require('q');
var models = require('./../models');
var Topic = models.Topic;
var Session = models.Session;

module.exports = {
  getAll: getAll
};

function getAll(accountId) {
  let deferred = q.defer();
  Topic.findAll({where: {accountId: accountId}}).then(function(results){
    deferred.resolve(results);
  },function(err) {
    deferred.reject(err);
  })
  return deferred.promise;
}

function joninSession(topicId, sessionId) {
  let deferred = q.defer();

  Topic.find({where: { id: topicId}}).then(function(topic) {
    Session.find({where: {id: sessionId} }).then(function(session) {
      topic.addSession(session).then(function(result) {
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

function creat(params, sessionId) {
  let deferred = q.defer();

  Topic.create(params).then(function(topic) {
    Session.find({where: {id: sessionId}}).then(function(session) {
      topic.addSession(session).then(function(result) {
        deferred.resolve(result);
      },function(err) {
        deferred.reject(err);
      })
    }, function(err) {
      deferred.reject(err);
    })
  },function(err) {
    deferred.reject(err);
  })
  return deferred.promise;
}
