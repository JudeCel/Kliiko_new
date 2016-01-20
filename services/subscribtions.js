'use strict';

let q = require('q');
let models = require('./../models');

let User = models.User;
let Subscription = models.Subscription;

module.exports = {
  create: create
};


function create(userId, hostedPageDat) {
  let deferred = q.defer();
  deferred.resolve(userId);
  return deferred.promise;
}