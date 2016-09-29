"use strict";

var assert = require('assert');
var models = require('./../../models');
var mailTemplates = require('./../fixtures/mailTemplates');
var updateBaseMailTemplatesLogic = require('./../../tasks/updateBaseMailTemplatesLogic.js');
var stringHelpers =  require('./../../util/stringHelpers.js');
var async = require('async');
var fs = require('fs');
var _ = require('lodash');
var q = require('q');
var path = './seeders/mailTemplateFiles/';

describe('Mail Template Task', () => {

  describe("success", function () {
    beforeEach((done) => {
      models.sequelize.sync({ force: true }).done((error, result) => {
        mailTemplates.createMailTemplate().then(function() {
          done();
        });
      });
    });

    it.only("run task", (done) => {
      updateBaseMailTemplatesLogic.doUpdate({ skipLogs: true }).then(function() {

         doCheck().then(function() {
           done();
         }, function(error){
           done(error);
         });

         function doCheck() {
           var deferred = q.defer();
           var filesList = fs.readdirSync(path);
           var filesInfo = {};
           _.map(filesList, function (item) {
             var nameParts = item.replace(".html", "").split("_");
             var categoryName = stringHelpers.lowerCaseFirstLetter(nameParts[1]);
             filesInfo[categoryName] = item;
           });
           models.MailTemplateBase.findAll().then(function(data) {
             async.map(data, processCheckCallBack(filesInfo), function(error, results) {
               if (error) {
                 deferred.reject(error);
               }
               if (results) {
                 deferred.resolve();
               }
             });
           }, function(error) {
             deferred.reject(error);
           });
           return deferred.promise;
         }

         function processData(item, fileObject, callback) {
           fs.readFile(path + fileObject[item.category], 'utf8', function read(error, fileData) {
             if (error) {
               callback(error);
             }
             if(fileData) {
               models.MailTemplateBase.find({ where: { category: item.category } }).then(function(data) {
                 if(data.content == fileData) {
                   callback(null, "Checked email template for " + item.category);
                 } else {
                   callback("Failed email template for " + item.category);
                 }
               }, function(error) {
                 callback(error);
               });
             }
           });
         }

         function processCheckCallBack(infoDataObject) {
           return function(item, callback) {
             processData(item, infoDataObject, callback);
           }
         }

      }, function(error){
        done(error);
      });
    });
  });

});
