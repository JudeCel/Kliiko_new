'use strict';

var q = require('q');
var models = require('./../models');
var ContactListUser = models.ContactListUser;

function findByContactList(contactListId) {
    var deferred = q.defer();
    ContactListUser.findAll({where: { contactListId: contactListId }}).then(function(results) {
      deferred.resolve(results);
    }, function(err) {
      deferred.reject(err);
    })
    return deferred.promise;
}

function find(id) {
    var deferred = q.defer();
    ContactListUser.find({where: { id: id }}).then(function(result) {
      deferred.resolve(result);
    }, function(err) {
      deferred.reject(err);
    })
    return deferred.promise;
}

function create(params) {
  var deferred = q.defer();
  ContactListUser.create(params).then(function(result) {
    deferred.resolve(result);
  }, function(err) {
    deferred.reject(err);
  })
  return deferred.promise;
}

function update(params) {
  var deferred = q.defer();
  ContactListUser.update(params).then(function(result) {
    deferred.resolve(result);
  }, function(err) {
    deferred.reject(err);
  })
  return deferred.promise;
}

module.exports = {
  findByContactList: findByContactList,
  find: find
  create: create
}
