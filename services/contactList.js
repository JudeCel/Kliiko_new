'use strict';

var q = require('q');
var models = require('./../models');
var dataWrappers = require('./../models/dataWrappers');
var ContactListUser = dataWrappers.ContactListUser
var ContactList = models.ContactList;
var _ = require('lodash');


function allByAccount(accountId) {
    var deferred = q.defer();
    ContactList.findAll({where: { accountId: accountId },
      attributes: ['id', 'name', 'defaultFields', 'customFields'],
      include: [{
        model: models.ContactListUser, attributes: ['id', 'customFields'],
        include: [{model: models.User, attributes: [
          'firstName','lastName', 'gender', 'email','city', 'state','country',
          'postcode','companyName','landlineNumber','mobile'
        ]}]
      }]
    }).then(function(results) {
      console.log(results);
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
      defaultFields: list.customFields,
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
