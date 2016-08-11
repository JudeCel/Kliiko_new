'use strict';

var q = require('q');
var models = require('./../models');
var dataWrappers = require('./../models/dataWrappers');
var filters = require('./../models/filters');
var ContactListUser = dataWrappers.ContactListUser;
var ContactList = models.ContactList;
var _ = require('lodash');
var async = require('async');
var constants = require('../util/constants');
var validators = require('./../services/validators');
var contactListImport = require('./contactListImport');

var csv = require('fast-csv');
var xlsx = require('xlsx');
var path = require('path');
const ROW_NR = 2;
const MAX_CUSTOM_FIELDS = 16;


module.exports = {
  create: create,
  update: update,
  allByAccount: allByAccount,
  destroy: destroy,
  createDefaultLists: createDefaultLists,
  parseFile: contactListImport.parseFile,
  validateContactList: contactListImport.validateContactList
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
function allByAccount(accountId, sessionId) {
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
            model: models.Invite,
          }]
        }],
        order: ['position']
      }]
    }).then(function(results) {
      if(sessionId) {
        removeInvitedUsers(results, sessionId).then(function(mapedResults) {
          deferred.resolve(prepareData(mapedResults));
        }, function(error) {
          deferred.reject(error);
        })
      }else{
        deferred.resolve(prepareData(results));
      }
    }, function(err) {
      deferred.reject(err);
    });
    return deferred.promise;
}

function removeInvitedUsers(results, sessionId) {
  let deferred = q.defer();

  async.waterfall([
    function(cb) {
      removeAlreadyInvitedresult(sessionId, results).then(function(listWithoutAlreadyInvitedUsers) {
        cb(null, listWithoutAlreadyInvitedUsers);
      }, function(error) {
        cb(error);
      })
    },
    function(listWithoutAlreadyInvitedUsers, cb) {
      removeFacilitatorFromList(sessionId, listWithoutAlreadyInvitedUsers).then(function(listWithoutFacilitator) {
        deferred.resolve(listWithoutFacilitator);
      }, function(error) {
        deferred.reject(error);
      })
    }
  ], function(error, list) {
    if(error) {
      deferred.reject(error);
    }
    else {
      deferred.resolve(list);
    }
  });

  return deferred.promise;
}

function removeAlreadyInvitedresult(sessionId, results) {
  let deferred = q.defer();

  try{
    _.map(results, function(result) {
      let users = []
      _.map(result.ContactListUsers, function(user) {
        let array = [];

        if(user.AccountUser.Invites) {
          _.map(user.AccountUser.Invites, function(invite) {
            if(invite.sessionId == sessionId){
              array.push(user);
            }
          })

          if(!_.isEmpty(array)){
            users.push(user);
          }
        }
      });

      if(!_.isEmpty(users)){
        result.ContactListUsers = _.xor(result.ContactListUsers, users);
      }
    })
    deferred.resolve(results);

  }catch(error){
    deferred.reject(error);
  }

  return deferred.promise;
}

function removeFacilitatorFromList(sessionId, results) {
  let deferred = q.defer();

  _.map(results, function(result) {
    if(result.name == "Facilitators"){
      models.SessionMember.find({
        where: {
          sessionId: sessionId,
          role: 'facilitator'
        }
      }).then(function(facilitator) {
        _.remove(result.ContactListUsers, function(user) {
          return user.accountUserId == facilitator.accountUserId;
        })
        deferred.resolve(results);
      }).catch(function(error) {
        deferred.reject(filters.errors(error));
      });
    }
  })

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
      maxCustomFields: MAX_CUSTOM_FIELDS,
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

  validators.hasValidSubscription(params.accountId).then(function() {
    validators.subscription(params.accountId, 'contactList', 1).then(function() {
      ContactList.create(params).then(function(result) {
        result.dataValues.maxCustomFields = MAX_CUSTOM_FIELDS;
        deferred.resolve(result);
      }, function(err) {
        deferred.reject(err);
      });
    }, function(error) {
      deferred.reject(error);
    });
  }, function(error) {
    deferred.reject(error);
  })

  return deferred.promise;
}

function update(params) {
  let deferred = q.defer();
  validators.hasValidSubscription(params.accountId).then(function() {
    ContactList.update(params,  {where: {id: params.id} }).then(function(result) {
      deferred.resolve(result);
    }, function(err) {
      deferred.reject(err);
    });
  }, function(error) {
    deferred.reject(error);
  })
  return deferred.promise;
}

function createDefaultLists(accountId, t) {
  let deferred = q.defer();
  ContactList.bulkCreate([
    { name: 'Account Managers', accountId: accountId, editable: false, role: 'accountManager' },
    { name: 'Facilitators', accountId: accountId, editable: false, role: 'facilitator'},
    { name: 'Observers', accountId: accountId, editable: false, role: 'observer' }
  ], { transaction: t, returning: true }).then(function(results) {
    deferred.resolve({results: results, transaction: t});
  }, function(err) {
    deferred.reject({error: err, transaction: t});
  });
  return deferred.promise;
}
