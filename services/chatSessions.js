"use strict";
var Session  = require('./../models').Session;
var q = require('q');

function getAllSessions(accountId) {
  let deferred = q.defer();
  // Session.finAll({
  //   where: {}
  // }).then(function(result) {
  //   deferred.resolve(results)
  // })
  // .catch(function (err) {
  //   deferred.reject(err);
  // });
   deferred.resolve({status: "OK"})
  return deferred.promise;
}

function deleteSession (sessionId) {
  // body...
}

function copySession (sessionId) {
  // body...
}

module.exports = {
  getAllSessions: getAllSessions,
  copySession: copySession,
  deleteSession: deleteSession
}
