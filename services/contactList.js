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
var MessagesUtil = require('./../util/messages');

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
    let selectFields =  constants.contactListDefaultFields.concat('id').concat("invitesInfo");
    let deferred = q.defer();
    ContactList.findAll({where: { accountId: accountId },
      attributes: ['id', 'name', 'defaultFields', 'customFields', 'visibleFields', 'editable', 'participantsFields', 'role'],
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

  validators.hasValidSubscription(params.accountId).then(function() {
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
    }, function(error) {
      deferred.reject(filters.errors(error));
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
  let deferred = q.defer();
  console.log(0);

  canExportContactListData(account).then(function() {
    console.log(1, params);
    ContactList.find({
      where: { id: params.id/*, accountId: account.id*/ },
      /*include: [{
        model: ContactListUser
      }]*/
    }).then(function(contactList) {
      console.log(3);
      if(contactList) {
        console.log(4);
        let header = createCsvHeader(contactList);
        let data = createCsvData(header, contactList);
        console.log(6);
        deferred.resolve({ header: header, data: data });
      } else {
        console.log(5);
        deferred.reject(MessagesUtil.ContactList.notFound);
      }
    }).catch(function(error) {
      deferred.reject(filters.errors(error));
    });
  }, function(error) {
    console.log(2);
    deferred.reject(error);
  });

  return deferred.promise;
};

function canExportContactListData(account) {
  let deferred = q.defer();
  validators.planAllowsToDoIt(account.id, 'exportContactListAndParticipantHistory').then(function() {
    deferred.resolve({});
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

function createCsvHeader(contactList) {
  let array = [];
  /*questions.forEach(function(question) {
    if(question.answers[0].contactDetails) {
      _.map(question.answers[0].contactDetails, function(contact) {
        array.push(contact.name);
      });
    } else {
      array.push(question.name);
    }
  });*/

  return array;
};

function createCsvData(header, contactList) {
  let array = [];

  /*survey.SurveyAnswers.forEach(function(surveyAnswer) {
    let object = {};
    let indexDiff = 0;

    survey.SurveyQuestions.forEach(function(question, index) {
      let answer = surveyAnswer.answers[question.id];

      switch(answer.type) {
        case 'number':
          assignNumber(index + indexDiff, header, object, question, answer);
          break;
        case 'string':
          object[header[index + indexDiff]] = answer.value;
          break;
        case 'boolean':
          assignBoolean(index + indexDiff, header, object, question, answer);
          break;
        case 'object':
          if (answer.contactDetails) {
            for(var property in answer.contactDetails) {
              while (property.toLowerCase() != header[index + indexDiff].replace(' ', '').toLowerCase()) {
                indexDiff++;
              }
              object[header[index + indexDiff]] = answer.contactDetails[property];
            }
          }
          break;
      }
    });

    array.push(object);
  });*/

  return array;
};