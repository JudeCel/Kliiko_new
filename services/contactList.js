'use strict';

var q = require('q');
var models = require('./../models');
var dataWrappers = require('./../models/dataWrappers');
var ContactListUser = dataWrappers.ContactListUser;
var ContactList = models.ContactList;
var _ = require('lodash');
var constants = require('../util/constants');
var csv = require('fast-csv');

module.exports = {
  create: create,
  update: update,
  allByAccount: allByAccount,
  destroy: destroy,
  createDefaultLists: createDefaultLists,
  parseFile: parseFile
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
    let deferred = q.defer();
    ContactList.findAll({where: { accountId: accountId },
      attributes: ['id', 'name', 'defaultFields', 'customFields', 'visibleFields', 'editable'],
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
  let deferred = q.defer();
  ContactList.create(params).then(function(result) {
    deferred.resolve(result);
  }, function(err) {
    deferred.reject(err);
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
    { name: 'Account Managers', accountId: accoutId, editable: false },
    { name: 'Facilitators', accountId: accoutId, editable: false },
    { name: 'Observers', accountId: accoutId, editable: false }
  ], { transaction: t }).done(function(results) {
    deferred.resolve({results: results, transaction: t});
  }, function(err) {
    deferred.reject({error: err, transaction: t});
  });
  return deferred.promise;
}

function parseFile(id, filePath) {
  let deferred = q.defer();
  ContactList.find({ where: { id: id } }).then(function(contactList) {
    if(contactList) {
      let object = { valid: [], invalid: [] };

      csv.fromPath(filePath, {
        headers: true
      }).transform(function(data) {
        _.map(data, function(value, key) {
          delete data[key];
          data[_.camelCase(key)] = value;
        });

        return data;
      }).validate(function(data, next) {
        validateRow(contactList.defaultFields, contactList.customFields, data).then(function() {
          next(null, true);
        }, function(error) {
          data.validationErrors = error;
          next(null, false);
        });
      }).on('data', function(data) {
        object.valid.push(data);
      }).on('data-invalid', function(data) {
        object.invalid.push(data);
      }).on('error', function(error) {
        deferred.reject(error);
      }).on('end', function() {
        deferred.resolve(object);
      });
    }
    else {
      deferred.reject('ContactList not found!');
    }
  });

  return deferred.promise;
};

function validateRow(defaults, customs, row) {
  let deferred = q.defer();
  let error = {};

  _.map(defaults, function(key) {
    let rowData = row[key];

    if(!rowData) {
      error[key] = 'Not found';
    }
    else {
      if(rowData.length == 0) {
        error[key] = 'No data';
      }
    }
  });

  _.map(customs, function(key) {
    let rowData = row[key];

    if(!rowData) {
      error[key] = 'Not found';
    }
  });

  if(_.size(error) > 0) {
    deferred.reject(error);
  }
  else {
    deferred.resolve(true);
  }

  return deferred.promise;
};
