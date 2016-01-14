'use strict';
let q = require('q');

module.exports = {
  getAllTopic: getAllTopic
};

function getAllTopic() {
  let deferred = q.defer();
  deferred.resolve('hi');
  return deferred.promise;
}