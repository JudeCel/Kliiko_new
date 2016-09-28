'use strict';

require('dotenv-extended').load({
  errorOnMissing: true
});

var async = require('async');
var fs = require('fs');
var _ = require('lodash');
var models = require("../models");
var path = './seeders/mailTemplateFiles/';
var q = require('q');


function doUpdate(config) {
  let deferred = q.defer();

  var filesList = fs.readdirSync(path);
  var filesInfo = {};

  _.map(filesList, function (item){
    var nameParts = item.replace(".html", "").split("_");
    var categoryName = lowerCaseFirstLetter(nameParts[1]);
    filesInfo[categoryName] = item;
  });

  models.MailTemplateBase.findAll().then(function(data) {
    async.map(data, processCallBack(filesInfo), function(error, results) {
      if (error) {
        outLog(config, error);
        deferred.reject(error);
      }
      if (results) {
        outLog(config, results);
        deferred.resolve();
      }
    });
  }, function(error) {
    outLog(config, error);
    deferred.reject(error);
  });

  return deferred.promise;
}

function outLog(config, message) {
  if (!config || !config.skipLogs) {
    console.log(message);
  }
}

function lowerCaseFirstLetter(string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}

function processData(item, fileObject, callback) {
  fs.readFile(path + fileObject[item.category], 'utf8', function read(error, fileData) {
    if (error) {
      callback(error);
    }
    if(fileData) {
      models.MailTemplateBase.update({ content: fileData }, { where: { category: item.category } }).then(function(updateData) {
        callback(null, "Updated email template for " + item.category);
      }, function(error) {
        callback(error);
      });
    }
  });
}

function processCallBack(infoDataObject) {
  return function(item, callback) {
    processData(item, infoDataObject, callback);
  }
}

module.exports = {
  doUpdate: doUpdate
}
