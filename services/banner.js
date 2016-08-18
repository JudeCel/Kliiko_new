'use strict';

var MessagesUtil = require('./../util/messages');
var models = require('./../models');
var filters = require('./../models/filters');
var Banner = models.Banner;

var q = require('q');

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
      deferred.reject(MessagesUtil.banner.exists);
    }
    else {
      Banner.create(params).then(function(banner) {
        deferred.resolve(prepareParams(banner, MessagesUtil.banner.created));
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
        deferred.resolve(prepareParams(banner, MessagesUtil.banner.updated));
      }, function(error) {
        deferred.reject(filters.errors(error));
      });
    }
    else {
      deferred.reject(MessagesUtil.banner.notFound);
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
