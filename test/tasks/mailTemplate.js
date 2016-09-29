"use strict";

var assert = require('assert');
var models = require('./../../models');
var mailTemplates = require('./../fixtures/mailTemplates');
var updateBaseMailTemplatesLogic = require('./../../tasks/updateBaseMailTemplatesLogic.js');
var stringHelpers =  require('./../../util/stringHelpers.js');
var async = require('async');
var fs = require('fs');
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

    it("run task", (done) => {
      updateBaseMailTemplatesLogic.doUpdate({ skipLogs: true }).then(function() {

         doCheck().then(function() {
           done();
         }, function(error){
           done(error);
         });

         function doCheck() {
           let deferred = q.defer();
           let filesInfo = updateBaseMailTemplatesLogic.getTemplateFilesInfo(path);
           let filesCount = 0;
           //need this array for async.map
           let filesInfoArr = [];

           for (let item in filesInfo) {
             if (filesInfo.hasOwnProperty(item)) {
               filesCount++;
               filesInfoArr.push({ category: item, filePath: path + filesInfo[item] });
             }
           }

           if(fs.readdirSync(path).length != filesCount) {
             deferred.reject("Wrong amount of files");
           }

           checkContents(filesInfoArr).then(function(data) {
             deferred.resolve();
           }, function(error) {
             deferred.reject(error);
           });

           return deferred.promise;
         }

         function checkContents(filesInfo) {
           let deferred = q.defer();

           async.map(filesInfo, function(fileInfo, callback) {
             checkContent(fileInfo.filePath, fileInfo.category).then(function(data) {
               callback();
             }, function(error) {
               callback(error);
             });
           }, function(error) {
             if (error) {
               deferred.reject(error);
             } else {
               deferred.resolve();
             }
           });

           return deferred.promise;
         }

         function checkContent(filePath, category) {
           let deferred = q.defer();

           fs.readFile(filePath, 'utf8', function read(error, fileData) {
             if (error) {
               deferred.reject(error);
             }
             if(fileData) {
               models.MailTemplateBase.find({ where: { category: category } }).then(function(data) {
                 if(data.content == fileData) {
                   deferred.resolve();
                 } else {
                   deferred.reject("Failed email template for " + category);
                 }
               }, function(error) {
                 deferred.reject(error);
               });
             }
           });

           return deferred.promise;
         }

      }, function(error){
        done(error);
      });
    });
  });

});
