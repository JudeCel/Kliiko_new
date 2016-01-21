'use strict';

var q = require('q');
var models = require('./../models');
var User = require('./../models').User;
var uuid = require('node-uuid');
var async = require('async');
var ContactListUser = models.ContactListUser;

module.exports = {
  findByContactList: findByContactList,
  find: find,
  create: create,
  destroy: destroy,
  updatePositions: updatePositions
}

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
    })
    return deferred.promise;
}

function create(params) {
  var deferred = q.defer();
  User.findOrCreate({
    where: { email: params.defaultFields.email },
    defaults: newUserParams(params.defaultFields)}).then(function(user) {
      let newUser = user[0];
      newUser.updateAttributes(params.defaultFields).then(function(result) {
        ContactListUser.create({
          customFields: params.customFields || { },
          accountId: params.accountId,
          userId: result.id,
          contactListId: params.contactListId
        }).then(function(contactLU) {
          deferred.resolve(contactLU);
        },function(err) {

          if(err.name == 'SequelizeUniqueConstraintError') {
            err.errors = [{message: "Email has already been taken", type: "Validation error", path: "email"}];
            err.errors.push(err);

            deferred.reject(err);
          }
          else {
            deferred.reject(err);
          }


        })
      },function(err) {
        deferred.reject(err);
      })
    },function(err) {
      deferred.reject(err);
    });
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
