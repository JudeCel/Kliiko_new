'use strict';

require('dotenv-extended').load({
  errorOnMissing: true
});

var async = require('async');
var fs = require('fs');
var _ = require('lodash');
var models = require("../models");
var stringHelpers = require('../util/stringHelpers.js');
var q = require('q');
var path = './seeders/mailTemplateFiles/';


function doUpdate(config) {
  let deferred = q.defer();
  let filesInfo = getTemplateFilesInfo(path);

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

function getTemplateFilesInfo(filesPath) {
  let filesList = fs.readdirSync(filesPath);
  let filesInfo = {};
  _.map(filesList, function (item){
    let nameParts = item.replace(".html", "").split("_");
    let categoryName = stringHelpers.lowerCaseFirstLetter(nameParts[1]);
    filesInfo[categoryName] = item;
  });
  return filesInfo;
}

function outLog(config, message) {
  if (!config || !config.skipLogs) {
    console.log(message);
  }
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
  doUpdate: doUpdate,
  getTemplateFilesInfo: getTemplateFilesInfo
}