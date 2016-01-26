'use strict';

var q = require('q');
var _ = require('lodash');
var models = require('./../models');
var User = models.User;
var AccountUser = models.AccountUser;
var ContactList = models.ContactList;
var ContactListUser = models.ContactListUser;
var AccountUserService = require('./../services/accountUser');

var uuid = require('node-uuid');
var async = require('async');

module.exports = {
  findByContactList: findByContactList,
  find: find,
  create: create,
  update: update,
  destroy: destroy,
  updatePositions: updatePositions
};

function findByContactList(contactListId) {
    var deferred = q.defer();
    ContactListUser.findAll({where: { contactListId: contactListId }, order: ['position']}).then(function(results) {
      deferred.resolve(results);
    }, function(err) {
      deferred.reject(err);
    });
    return deferred.promise;
}


// params = [{id: 1, position: 3}, ...]
function updatePositions(params) {
  var deferred = q.defer();
    async.map(params, update, function(err, result) {
      if (err) {
        deferred.reject(err);
      }else{
        deferred.resolve(result);
      }
    })

  function update(attrs, cb) {
    ContactListUser.update({position: attrs.position }, {where: {id: attrs.id}}).then(function(result) {
      cb(null,result);
    }, function(err) {
      cb(err);
    })
  }
  return deferred.promise;
}

function destroy(ids, accountId) {
  let deferred = q.defer();
  ContactListUser.destroy({where: { id: ids, accountId: accountId}}).then(function(result) {
    deferred.resolve(result);
  }, function(err) {
    deferred.reject(err);
  });
  return deferred.promise;
}

function find(id) {
    var deferred = q.defer();
    ContactListUser.find({where: { id: id }}).then(function(result) {
      deferred.resolve(result);
    }, function(err) {
      deferred.reject(err);
    });
    return deferred.promise;
}

function create(params) {
  var deferred = q.defer();
  AccountUser.find(
    { where: {
        email: params.defaultFields.email,
        AccountId: params.accountId
      }
    }
  ).then(function(accountUser) {
    if (accountUser) {
      accountUser.createContactListUser(contactListUserParams(params, accountUser.id)).then(function(contactListUser) {
        deferred.resolve(contactListUser);
      }, function(err) {
        deferred.reject(err);
      })
    }else{
      createNewAccountUser(params).then(function(newAccountUser) {
        ContactListUser.create(contactListUserParams(params, newAccountUser.id)).then(function(contactListUser) {
          deferred.resolve(contactListUser);
        }, function(err) {
          deferred.reject(err);
        })
      }, function(err) {
        deferred.reject(err);
      })
    }
  });
  return deferred.promise;
}

function createNewAccountUser(params) {
  var deferred = q.defer();
  ContactList.find({where: {id: params.contactListId}}).then(function(contactList) {
    AccountUserService.create(params.defaultFields, params.accountId, contactList.role).then(function(accountUser) {
      deferred.resolve(accountUser);
    }, function(err) {
      if(err.name == 'SequelizeUniqueConstraintError') {
        err.errors = [{message: "Email has already been taken", type: "Validation error", path: "email"}];
        deferred.reject(err);
      }else {
        deferred.reject(err);
      }
    })
  })
  return deferred.promise;
}

function contactListUserParams(params, accountUserId) {
  return {
    accountUserId: accountUserId,
    accountId: params.accountId,
    contactListId: params.contactListId,
    customFields: params.customFields || {}
  }
}

function update(params) {
  var deferred = q.defer();
  ContactListUser.update(params,{
    where:{ id: params.id }
  }).then(function(result) {
    deferred.resolve(result);
  }, function(err) {
    deferred.reject(err);
  });
  return deferred.promise;
}
