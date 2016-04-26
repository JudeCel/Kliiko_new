'use strict';

var models = require('./../models');
var filters = require('./../models/filters');
var Banner = models.Banner;

var q = require('q');

module.exports = {
  create: create
};

function create(params) {
  let deferred = q.defer();

  Banner.find({
    where: { page: params.page }
  }).then(function(result) {
    if(result) {
      deferred.reject('Banner already exists!');
    }
    else {
      Banner.create(params).then(function(banner) {
        deferred.resolve(banner);
      }, function(error) {
        deferred.reject(filters.errors(error));
      });
    }
  }, function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}
