'use strict';

var q = require('q');
var models = require('./../models');
var ContactList = models.ContactList;


function allByAccount(accountId) {
    var deferred = q.defer();
    ContactList.findAll({where: { accountId: accountId }}).then(function(results) {
      if (results.length < 3) {
        createDefaultLists(accountId).then(function(defaultLists) {
          deferred.resolve(defaultLists);
        },function(err) {
          deferred.reject(err);
        })
      }
    }, function(err) {
      deferred.reject(err);
    })
    return deferred.promise;
}

function create(params, accountId) {
  var deferred = q.defer();
  params.accountId = accountId;

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
    { name: 'Account Managers', accountId: accoutId },
    { name: 'Facilitators', accountId: accoutId },
    { name: 'Observers', accountId: accoutId }
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
