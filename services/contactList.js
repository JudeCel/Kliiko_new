'use strict';

var q = require('q');
var models = require('./../models');
var dataWrappers = require('./../models/dataWrappers');
var ContactListUser = dataWrappers.ContactListUser;
var ContactList = models.ContactList;
var _ = require('lodash');
var async = require('async');
var constants = require('../util/constants');
var validators = require('./../services/validators');

var csv = require('fast-csv');
var xlsx = require('xlsx');
var path = require('path');
const ROW_NR = 2;

module.exports = {
  create: create,
  update: update,
  allByAccount: allByAccount,
  destroy: destroy,
  createDefaultLists: createDefaultLists,
  parseFile: require('./contactListImport').parseFile
};

function destroy(contacListId, accoutId) {
  let deferred = q.defer();
  ContactList.destroy({where: {id: contacListId, accountId: accoutId, editable: true} }).then(function(result) {
    deferred.resolve(prepareData(result));
  }, function(err) {
    deferred.reject(err);
  });
  return deferred.promise;
}
function allByAccount(accountId) {
    let selectFields =  constants.contactListDefaultFields.concat('id')
    // selectFields.push([models.sequelize.fn('COUNT', models.sequelize.col('ContactListUsers.AccountUser.Invites.id')), 'Invites'])
    let deferred = q.defer();
    ContactList.findAll({where: { accountId: accountId },
      attributes: ['id', 'name', 'defaultFields', 'customFields', 'visibleFields', 'editable', 'participantsFields'],
      group: [
        "ContactList.id",
        "ContactListUsers.id",
        "ContactListUsers.AccountUser.id",
        "ContactListUsers.AccountUser.Invites.id" ],
      include: [{
        model: models.ContactListUser, attributes: ['id', 'customFields', 'accountUserId'],
        include: [{
          model: models.AccountUser,
          attributes: selectFields,
          include: [{
            model: models.Invite
          }]
        }],
        order: ['position']
      }]
    }).then(function(results) {
      deferred.resolve(prepareData(results));
    }, function(err) {
      deferred.reject(err);
    });
    return deferred.promise;
}

function prepareData(lists) {
  let collection = [];
  _.map(lists, (list)=> {
    collection.push( {
      id: list.id,
      editable: list.editable,
      defaultFields: list.defaultFields,
      customFields: list.customFields,
      visibleFields: list.visibleFields,
      participantsFields: list.participantsFields,
      name: list.name,
      membersCount: list.ContactListUsers.length,
      members: _.map(list.ContactListUsers, (listUser) => {
        return new ContactListUser(
          list.defaultFields,
          list.customFields,
          list.participantsFields,
          list.visibleFields,
          listUser
        );
      })
    })
  });
  return collection;
}

function create(params) {
  let deferred = q.defer();

  validators.subscription(params.accountId, 'contactList', 1).then(function() {
    ContactList.create(params).then(function(result) {
      deferred.resolve(result);
    }, function(err) {
      deferred.reject(err);
    });
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function update(params) {
  let deferred = q.defer();
  ContactList.update(params,  {where: {id: params.id} }).then(function(result) {
    deferred.resolve(result);
  }, function(err) {
    deferred.reject(err);
  });
  return deferred.promise;
}

function createDefaultLists(accoutId, t) {
  let deferred = q.defer();
  ContactList.bulkCreate([
    { name: 'Account Managers', accountId: accoutId, editable: false, role: 'accountManager' },
    { name: 'Facilitators', accountId: accoutId, editable: false, role: 'facilitator'},
    { name: 'Observers', accountId: accoutId, editable: false, role: 'observer' }
  ], { transaction: t }).done(function(results) {
    deferred.resolve({results: results, transaction: t});
  }, function(err) {
    deferred.reject({error: err, transaction: t});
  });
  return deferred.promise;
}
