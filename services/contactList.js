'use strict';

var q = require('q');
var models = require('./../models');
var ContactList = models.ContactList;


function allByAccount(accountId) {
    var deferred = q.defer();
    ContactList.findAll({where: { accountId: accountId }}).then(function(result) {
      deferred.resolve(result);
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

module.exports = {
  create: create,
  allByAccount: allByAccount
}
