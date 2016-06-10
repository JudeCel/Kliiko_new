'use strict';

var q = require('q');
var models = require('./../models');
var ContactList = models.ContactList;
var _ = require('lodash');
var async = require('async');

var csv = require('fast-csv');
var xlsx = require('xlsx');
var path = require('path');

module.exports = {
  parseFile: parseFile
};

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
          case '.xlsx':
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
    let rowNr = 2; // this number represent start row for number

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

        data.landlineNumber = data.landlineNumber.toString();
        data.mobile = data.mobile.toString();

        if(data.mobile.length > 0 && !data.mobile.includes("+61")) {
          data.mobile = "+61 " + data.mobile;
        }

        if(data.landlineNumber.length > 0 && !data.landlineNumber.includes("+61")) {
          data.landlineNumber = "+61 " + data.landlineNumber;
        }

        object.valid.push(data);
        cb();
      }, function(error) {
        data.validationErrors = error;
        if(data.isValid){object.invalid.push(data)};
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
  let rowNr = 2; // this number represent start row for number
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

      if(data.mobile.length > 0 && !data.mobile.includes("+61")) {
        data.mobile = "+61 " + data.mobile;
      }

      if(data.landlineNumber.length > 0 && !data.landlineNumber.includes("+61")) {
        data.landlineNumber = "+61 " + data.landlineNumber;
      }

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
      if(data.isValid){object.invalid.push(data)};
  }).on('error', function(error) {
    deferred.reject(error);
  }).on('end', function() {
    object.fileFields = fileFieldsArray(object.fileFields, tempHeaders);
    addDublicateEntries(object, uniqRowListCounter);
    deferred.resolve(object);
  });
}

function skipInvalidRow(data, contactList) {
  let fields = _.concat([], contactList.defaultFields);
  let errorKeys = Object.keys(data.validationErrors);
  let result =  _.dropWhile(fields, function(o) { return !errorKeys.indexOf(o) > -1 });
  return _.isEmpty(result)
}

function validateRow(emails, contactList, row, uniqRowListCounter) {
  let deferred = q.defer();
  let error = {};
  let validKeyCount = contactList.defaultFields.length

  _.map(contactList.defaultFields, function(key) {
    let rowData = row[key];

    if(!row.hasOwnProperty(key)) {
      // Column not  found
      error[key] = '';
      --validKeyCount
    }
    else {
      if(rowData.length == 0) {
        // Field is empty
        error[key] = '';
        --validKeyCount
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
      error[key] = '';

    }else {
      if(rowData.length == 0){
        error[key] = '';
      }
    }
  });

  row.isValid = (validKeyCount > 0)

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
