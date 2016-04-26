'use strict';

var models = require('./../models');
var filters = require('./../models/filters');
var Banner = models.Banner;

var q = require('q');

const MESSAGES = {
  notFound: 'Banner not found',
  exists: 'Banner already exists',
  created: 'Banner created successfully',
  updated: 'Banner updated successfully'
};

module.exports = {
  create: create,
  update: update
};

function create(params) {
  let deferred = q.defer();

  Banner.find({
    where: { page: params.page }
  }).then(function(result) {
    if(result) {
      deferred.reject(MESSAGES.exists);
    }
    else {
      Banner.create(params).then(function(banner) {
        deferred.resolve(prepareParams(banner, MESSAGES.created));
      }, function(error) {
        deferred.reject(filters.errors(error));
      });
    }
  }, function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function update(params) {
  let deferred = q.defer();

  Banner.find({
    where: { id: params.id }
  }).then(function(result) {
    if(result) {
      result.update({ link: params.link }).then(function(banner) {
        deferred.resolve(prepareParams(banner, MESSAGES.updated));
      }, function(error) {
        deferred.reject(filters.errors(error));
      });
    }
    else {
      deferred.reject(MESSAGES.notFound);
    }
  }, function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function prepareParams(result, message) {
  return {
    data: result,
    message: message
  };
}
