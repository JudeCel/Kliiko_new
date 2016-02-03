'use strict';

var q = require('q');
var models = require('./../models');
var dataWrappers = require('./../models/dataWrappers');
var ContactListUser = dataWrappers.ContactListUser;
var ContactList = models.ContactList;
var _ = require('lodash');
var async = require('async');
var constants = require('../util/constants');

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
    let selectFields =  constants.contactListDefaultFields.concat('id')
    // selectFields.push([models.sequelize.fn('COUNT', models.sequelize.col('ContactListUsers.AccountUser.Invites.id')), 'Invites'])
    console.log(selectFields);
    let deferred = q.defer();
    ContactList.findAll({where: { accountId: accountId },
      attributes: ['id', 'name', 'defaultFields', 'customFields', 'visibleFields', 'editable', 'participantsFields' ],
      group: [
        "ContactList.id",
        "ContactListUsers.id",
        "ContactListUsers.AccountUser.id",
        "ContactListUsers.AccountUser.Invites.id" ],
      include: [{
        model: models.ContactListUser, attributes: ['id', 'customFields'],
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

function parseFile(id, filePath) {
  let deferred = q.defer();

  ContactList.find({ where: { id: id } }).then(function(contactList) {
    if(contactList) {
      models.AccountUser.findAll({
        attributes: ['email'],
        include: [{
          model: models.ContactListUser,
          where: {
            contactListId: contactList.id,
            accountId: contactList.accountId
          }
        }]
      }).then(function(results) {
        let emails = _.map(results, function(value) {
          return value.email;
        });

        switch (path.extname(filePath)) {
          case '.csv':
            parseCsv(emails, deferred, contactList, filePath);
            break;
          case '.xls':
            parseXls(emails, deferred, contactList, filePath);
            break;
          default:
            deferred.reject("Wrong file format: " + path.extname(filePath) + "!");
        }
      }).catch(models.User.sequelize.ValidationError, function(error) {
        deferred.reject(error);
      }).catch(function(error) {
        deferred.reject(error);
      });
    }
    else {
      deferred.reject('ContactList not found!');
    }
  });

  return deferred.promise;
};

function parseXls(emails, deferred, contactList, filePath) {
  let object = defaultParserObject(contactList);
  let workbook = xlsx.readFile(filePath);

  async.forEach(workbook.SheetNames, function(sheetName, callback) {
    let worksheet = workbook.Sheets[sheetName];
    let json = xlsx.utils.sheet_to_json(worksheet, { raw: true, header: 1, id: true});
    let rowNr = ROW_NR; // this number represent start row for number

    let header = _.map(json[0], function(value, key) {
      let head = json[0][key];
      return _.camelCase(head ? head : '#emptyColumn');
    });
    json.splice(0, 1);

    object.fileFields = fileFieldsArray(object.fileFields, header);

    let uniqRowListCounter = {};

    async.forEach(json, function(array, cb) {
      let data = {rowNr: rowNr};
      _.map(header, function(value, index) {
        data[value] = array[index] || '';
      })
      ++ rowNr
      validateRow(emails, contactList, data, uniqRowListCounter).then(function() {
        object.valid.push(data);
        cb();
      }, function(error) {
        data.validationErrors = error;
        object.invalid.push(data);
        cb();
      });
    }, function() {
      addDublicateEntries(object, uniqRowListCounter)
      callback();
    });
  }, function() {
    deferred.resolve(object);
  });
};

function parseCsv(emails, deferred, contactList, filePath) {
  let object = defaultParserObject(contactList);
  let fieldsNeedStored = true;
  let tempHeaders = [];
  let rowNr = ROW_NR; // this number represent start row for number
  let uniqRowListCounter = {};

  csv.fromPath(filePath, {
    headers: true
  }).transform(function(data) {
    _.map(data, function(value, key) {
      delete data[key];
      data[_.camelCase(key)] = value;

      if (fieldsNeedStored) {
        tempHeaders.push(_.camelCase(key));
      }
    });

    fieldsNeedStored = false;
    data.rowNr = rowNr;
    return data;
  }).validate(function(data, next) {
    validateRow(emails, contactList, data, uniqRowListCounter).then(function() {
      ++ rowNr
      next(null, true);
    }, function(error) {
      ++ rowNr
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
    object.fileFields = fileFieldsArray(object.fileFields, tempHeaders);
    addDublicateEntries(object, uniqRowListCounter);
    deferred.resolve(object);
  });
}

function validateRow(emails, contactList, row, uniqRowListCounter) {
  let deferred = q.defer();
  let error = {};

  _.map(contactList.defaultFields, function(key) {
    let rowData = row[key];

    if(!row.hasOwnProperty(key)) {
      error[key] = 'Not found';
    }
    else {
      if(rowData.length == 0) {
        error[key] = 'No data';
      }

      if(key == 'email') {
        uniqRowListCounterFun(key, row, uniqRowListCounter)

        if (_.includes(emails, rowData)) {
          error[key] = 'Email already taken';
        }
      }
    }
  });

  _.map(contactList.customFields, function(key) {
    let rowData = row[key];

    if(!row.hasOwnProperty(key)) {
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

function fileFieldsArray(fileFields, header) {
  return _.uniq(_.concat(fileFields, header));
}

function uniqRowListCounterFun(key, row, counterCollection) {
  if (counterCollection[row[key]]) {
    counterCollection[row[key]].rows.push(row.rowNr)
    ++ counterCollection[row[key]].count
  }else{
    counterCollection[row[key]] = { rows: [row.rowNr], count: 1 }
  }
}

function addDublicateEntries(object, counterCollection) {
  _.forEach(counterCollection, function(val, key) {
    if (val.count > 1){
      object.duplicateEntries.push({email: key, rows: val.rows})
    }
  });
}

function defaultParserObject(contactList) {
  return {
    contactListFields: {
      defaultFields: contactList.defaultFields,
      customFields: contactList.customFields
    },
    duplicateEntries: [],
    fileFields: [],
    valid: [],
    invalid: []
  };
}