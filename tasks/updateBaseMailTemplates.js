'use strict';

require('dotenv-extended').load({
  errorOnMissing: true
});

var async = require('async');
var fs = require('fs');
var _ = require('lodash');
var models = require("../models");
var path = './seeders/mailTemplateFiles/';


function doUpdate() {
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
        console.log(error);
      }
      if (results) {
        console.log(results);
      }
      process.exit();
    });
  }, function(error) {
    console.log(error);
  });
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

doUpdate();
