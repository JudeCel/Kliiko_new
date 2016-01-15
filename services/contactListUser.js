'use strict';

var q = require('q');
var models = require('./../models');
var User = require('./../models').User;
var uuid = require('node-uuid');
var ContactListUser = models.ContactListUser;

module.exports = {
  findByContactList: findByContactList,
  find: find,
  create: create
}

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
  User.findOrCreate({
    where: { email: params.defaultFields.email },
    defaults: params.defaultFields}).then(function(user) {
      let newUser = user[0];
      newUser.updateAttributes(params.defaultFields).then(function(result) {
        ContactListUser.create({
          customFields: params.customFields,
          accountId: params.accountId,
          userId: result.id,
          contactListId: params.contactListId
        }).then(function(contactLU) {
          deferred.resolve(contactLU);
        },function(err) {
          deferred.reject(err);
        })
      },function(err) {
        deferred.reject(err);
      })
    },function(err) {
      deferred.reject(err);
    })
  return deferred.promise;
}


function newUserParams(params) {
  params.password = uuid.v1();
  return params
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
