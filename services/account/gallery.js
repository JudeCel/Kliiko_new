'use strict';

var q = require('q');
var account = require('./../../models').Account;
var gallery = require('./../../models').Gallery;

function findAllRecords(account_id){
  let deferred = q.defer();

  gallery.findAll({
      where: { accountId: account_id }
    })
    .then(function (result) {
      deferred.resolve(result);
    })
    .catch(function (err) {
      deferred.reject(err);
    });

  return deferred.promise;
}

function uploadNew(account_id){
  let deferred = q.defer();

  gallery.find({
      where: { accountId: account_id }
    })
    .then(function (result) {

      // deferred.resolve(result);
    })
    .catch(function (err) {
      // deferred.reject(err);
    });
}

module.exports = {
  findAllRecords: findAllRecords.
  uploadNew: uploadNew
};

