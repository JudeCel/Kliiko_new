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
var stringHelpers = require('../util/stringHelpers');
var validators = require('./../services/validators');
var contactListImport = require('./contactListImport');
var MessagesUtil = require('./../util/messages');
let Bluebird = require('bluebird');

const MAX_CUSTOM_FIELDS = 16;

module.exports = {
  create: create,
  update: update,
  allByAccount: allByAccount,
  destroy: destroy,
  createDefaultLists: createDefaultLists,
  parseFile: contactListImport.parseFile,
  validateContactList: contactListImport.validateContactList,
  exportContactList: exportContactList, 
  canExportContactListData: canExportContactListData
};

function destroy(contacListId, accoutId) {
  let deferred = q.defer();
  ContactList.destroy({where: {id: contacListId, accountId: accoutId, editable: true} }).then(function(result) {
    deferred.resolve(prepareData(result));
  }, function(error) {
    deferred.reject(filters.errors(error));
  });
  return deferred.promise;
}
function allByAccount(accountId, sessionId) {
    let selectFields =  constants.contactListDefaultFields.concat('id').concat("invitesInfo").concat("role");
    let deferred = q.defer();
    ContactList.findAll({where: { accountId: accountId },
      attributes: ['id', 'name', 'defaultFields', 'customFields', 'visibleFields', 'editable', 'participantsFields', 'role'],
      group: [
        "ContactList.id",
        "ContactListUsers.AccountUser.id",
        "ContactListUsers.id",
        "ContactListUsers.AccountUser.Invites.id",
        "Surveys.id",
        ],
      include: [
        {
          model: models.Survey, 
          required: false, 
          attributes: ['id'] 
        }, 
        {
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
    if(result.name == "Hosts"){
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
      survey: !_.isEmpty(list.Surveys),
      name: list.name,
      role: list.role,
      reqiredFields: reqiredFieldsForList(list),
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

function reqiredFieldsForList(list) {
  return constants.contactListReqiredFields;
}

function create(params) {
  let deferred = q.defer();

  validators.subscription(params.accountId, 'contactList', 1).then(function() {
    ContactList.create(params).then(function(result) {
      result.dataValues.maxCustomFields = MAX_CUSTOM_FIELDS;
      deferred.resolve(result);
    }, function(error) {
      deferred.reject(filters.errors(error));
    });
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function update(params) {
  return new Bluebird((resolve, reject) => {
    validators.hasValidSubscription(params.accountId).then(() => {
      models.sequelize.transaction((t) => {
        return ContactList.find({where: {id: params.id}}, {transaction: t}).then((contactList) => {
          return contactList.update(params, { transaction: t}).then((result) => {
           return  models.Survey.update({name: result.name}, {where: {contactListId: contactList.id}, transaction: t}).then(() => {
             return result
           }, (error) => {
             throw error;
           })
          }, (error) => {
            throw error;
          });
        });
      }).then((contactList) => {
          resolve(contactList);
      }).catch((error) => {
        reject(filters.errors(error));
      });
    }, (error) => {
      reject(error);
    })
  })
}

function createDefaultLists(accountId, t) {
  let deferred = q.defer();
  ContactList.bulkCreate([
    { name: 'Account Managers', accountId: accountId, editable: false, role: 'accountManager' },
    { name: 'Hosts', accountId: accountId, editable: false, role: 'facilitator'},
    { name: 'Spectators', accountId: accountId, editable: false, role: 'observer' }
  ], { transaction: t, returning: true }).then(function(results) {
    deferred.resolve({results: results, transaction: t});
  }, function(err) {
    deferred.reject({error: err, transaction: t});
  });
  return deferred.promise;
}

function exportContactList(params, account) {
  return new Bluebird((resolve, reject) => {
    canExportContactListData(account).then(function() {
      ContactList.find({
        where: { id: params.id, accountId: account.id },
        include: [{
          model: models.ContactListUser,
          include: [{
            model: models.AccountUser,
            include: [{
              model: models.SessionMember,
              attributes: ["comment"],
              include: [{
                model: models.Session,
                attributes: ["name"],
              }]
            }]
          }]
        }]
      }).then(function(contactList) {
        if(contactList) {
          let header = createCsvHeader(contactList);
          let data = createCsvData(header, contactList);
          let headerValues = Object.keys(header).map(function(key) {
            return header[key];
          });
          resolve({ header: headerValues, data: data });
        } else {
          reject(MessagesUtil.contactList.notFound);
        }
      }).catch(function(error) {
        reject(filters.errors(error));
      });
    }, function(error) {
      reject(error);
    });
  });
};

function canExportContactListData(account) {
  return new Bluebird((resolve, reject) => {
    validators.planAllowsToDoIt(account.id, 'exportContactListAndParticipantHistory').then(function() {
      resolve({});
    }, function(error) {
      reject(error);
    });
  });
}

function createCsvHeader(contactList) {
  let fields = { };

  _.each(constants.contactListDefaultFields, (field) => {
    fields[field] = stringHelpers.camel2Human(field);
  });

  _.each(contactList.customFields, (field) => {
    fields[field] = field;
  });

  _.each(constants.contactListParticipantsFields, (field) => {
    if (field != 'Comments') {
      fields[field] = stringHelpers.camel2Human(field);
    }
  });
  
  return fields;
};

function createCsvData(header, contactList) {
  let res = [];

  contactList.ContactListUsers.forEach((contactListUser) => {
    let object = { };

    _.each(constants.contactListDefaultFields, (field) => {
      object[header[field]] = contactListUser.AccountUser[field];
    });

    _.each(contactList.customFields, (field) => {
      object[header[field]] = contactListUser.customFields[field];
    });

    _.each(constants.contactListParticipantsFields, (field) => {
      if (field != 'Comments') {
        object[header[field]] = contactListUser.AccountUser.invitesInfo[field];
      }
    });

    _.each(contactListUser.AccountUser.SessionMembers, (sessionMember) => {
      let comment = sessionMember.comment;
      if (comment && comment.length > 0) {
        let columnName = "Comment Session: " + sessionMember.Session.name;
        if (!header[columnName]) {
          header[columnName] = columnName;
        }
        object[columnName] = comment;
      }
    });

    res.push(object);
  });

  return res;
};