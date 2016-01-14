'use strict';

var q = require('q');
var models = require('./../models');
var ContactList = models.ContactList;


function allByAccount(accountId) {
    var deferred = q.defer();
    ContactList.findAll({where: { accountId: accountId }}).then(function(results) {
      deferred.resolve(results);
    }, function(err) {
      deferred.reject(err);
    })
    return deferred.promise;
}

function create(params) {
  var deferred = q.defer();
  ContactList.create(params).then(function(result) {
    deferred.resolve(result);
  }, function(err) {
    deferred.reject(err);
  })
  return deferred.promise;
}

function createDefaultLists(accoutId) {
  var deferred = q.defer();
  ContactList.bulkCreate([
    { name: 'Account Managers', accountId: accoutId, editable: false },
    { name: 'Facilitators', accountId: accoutId, editable: false },
    { name: 'Observers', accountId: accoutId, editable: false }
  ]).done(function(results) {
    deferred.resolve(results);
  }, function(err) {
    deferred.reject(err);
  })
  return deferred.promise;
}

module.exports = {
  create: create,
  allByAccount: allByAccount,
  createDefaultLists
}
