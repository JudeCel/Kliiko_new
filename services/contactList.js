'use strict';

var q = require('q');
var models = require('./../models');
var dataWrappers = require('./../models/dataWrappers');
var ContactListUser = dataWrappers.ContactListUser
var ContactList = models.ContactList;
var _ = require('lodash');
var constants = require('../util/constants');


module.exports = {
  create: create,
  allByAccount: allByAccount,
  destroy: destroy,
  createDefaultLists: createDefaultLists
}

function destroy(contacListId, accoutId) {
  var deferred = q.defer();
  ContactList.destroy({where: {id: contacListId, accountId: accoutId, editable: true} }).then(function(result) {
    deferred.resolve(prepareData(result));
  }, function(err) {
    deferred.reject(err);
  })
  return deferred.promise;
}

function allByAccount(accountId) {
    var deferred = q.defer();
    ContactList.findAll({where: { accountId: accountId },
      attributes: ['id', 'name', 'defaultFields', 'customFields', 'visibleFields'],
      include: [{
        model: models.ContactListUser, attributes: ['id', 'customFields'],
        include: [{model: models.User, attributes: constants.contactListDefaultFields }],
        order: ['position']
      }]
    }).then(function(results) {
      deferred.resolve(prepareData(results));
    }, function(err) {
      console.log(err);
      deferred.reject(err);
    })
    return deferred.promise;
}


function prepareData(lists) {
  let collection = [];
  _.map(lists, (list)=> {
    collection.push( {
      id: list.id,
      defaultFields: list.defaultFields,
      customFields: list.customFields,
      name: list.name,
      membersCount: list.ContactListUsers.length,
      members: _.map(list.ContactListUsers, (listUser) => {
        return new ContactListUser(list.defaultFields, list.customFields, listUser);
      })
    })
  })
  return collection;
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

function createDefaultLists(accoutId, t) {
  var deferred = q.defer();
  ContactList.bulkCreate([
    { name: 'Account Managers', accountId: accoutId, editable: false },
    { name: 'Facilitators', accountId: accoutId, editable: false },
    { name: 'Observers', accountId: accoutId, editable: false }
  ], { transaction: t }).done(function(results) {
    deferred.resolve({results: results, transaction: t});
  }, function(err) {
    deferred.reject({error: err, transaction: t});
  })
  return deferred.promise;
}
