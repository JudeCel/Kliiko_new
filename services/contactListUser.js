'use strict';

var q = require('q');
var _ = require('lodash');
var models = require('./../models');
var AccountUser = models.AccountUser;
var ContactList = models.ContactList;
var ContactListUser = models.ContactListUser;
var AccountUserService = require('./../services/accountUser');
var dataWrappers = require('./../models/dataWrappers');
var async = require('async');

module.exports = {
  findByContactList: findByContactList,
  find: find,
  create: create,
  update: update,
  destroy: destroy,
  updatePositions: updatePositions,
  bulkCreate: bulkCreate
};

function findByContactList(contactListId) {
    let deferred = q.defer();
    ContactListUser.findAll({
      order: ['position'],
      include: [{model: ContactList, where: { id: contactListId} } ]
    }).then(function(results) {

      let collection = _.map(results, (item) => {
        collection.push(
          new ContactListUser(
            item.ContactList.defaultFields,
            item.ContactList.customFields,
            item
          )
        );
      })

      deferred.resolve(collection);
    }, function(err) {
      deferred.reject(err);
    });
    return deferred.promise;
}

// params = [{id: 1, position: 3}, ...]
function updatePositions(params) {
  // TODO: Need rewrite to one DB call!!!
  let deferred = q.defer();
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
    let deferred = q.defer();
    ContactListUser.find({where: { id: id }, include: [ ContactList ]}).then(function(result) {
      let contactListUser =  new ContactListUser(
        result.ContactList.defaultFields,
        result.ContactList.customFields,
        result
      );
      deferred.resolve(contactListUser);
    }, function(err) {
      deferred.reject(err);
    });
    return deferred.promise;
}

function transactionFun(t, accountId) {
  return function(attrs, callback) {
    attrs.accountId = accountId;
    create(attrs, t).then(function(result) {
      callback(null, result);
    },function(err) {
      callback(err);
    });
  }
}

function bulkCreate(list, accountId) {
  let deferred = q.defer();
    models.sequelize.transaction().then(function(t) {
      async.map(list, transactionFun(t, accountId), function(err, results){
        if (err) {
          t.rollback().then(function() {
            deferred.reject(err);
          });
        }else {
          t.commit().then(function() {
            deferred.resolve(results);
          });
        }
      });
    })
  return deferred.promise;
}

function create(params, transaction) {
  let deferred = q.defer();
  AccountUser.find(
    { where: {
        email: params.defaultFields.email,
        AccountId: params.accountId
      }
    }
  ).then(function(accountUser) {
    if (accountUser) {
      ContactListUser.create(contactListUserParams(params, accountUser.id), {transaction: transaction}).then(function(contactListUser) {
        deferred.resolve(contactListUser);
      }, function(err) {
        deferred.reject(err);
      })
    }else{
      createNewAccountUser(params, transaction).then(function(newAccountUser) {
        ContactListUser.create(contactListUserParams(params, newAccountUser.id), {transaction: transaction}).then(function(contactListUser) {
          deferred.resolve(contactListUser);
        }, function(err) {
          console.log(err);
          deferred.reject(err);
        })
      }, function(err) {
        deferred.reject(err);
      })
    }
  });
  return deferred.promise;
}

function createNewAccountUser(params, transaction) {
  let deferred = q.defer();
  ContactList.find({where: {id: params.contactListId}}).then(function(contactList) {
    AccountUserService.create(params.defaultFields, params.accountId, contactList.role, transaction).then(function(accountUser) {
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
  let deferred = q.defer();
  ContactListUser.update(params,{
    where:{ id: params.id }
  }).then(function(result) {
    deferred.resolve(result);
  }, function(err) {
    deferred.reject(err);
  });
  return deferred.promise;
}
