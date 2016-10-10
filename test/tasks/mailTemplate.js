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
var templatesCount = 21;

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
        done();
      }, function(error){
        done(error);
      });
    });

    it("files read", (done) => {
       let filesInfo = updateBaseMailTemplatesLogic.getTemplateFilesInfo(path);
       let filesCount = Object.keys(filesInfo).length;
       if(templatesCount == filesCount) {
         done();
       } else {
         done("Wrong amount of files");
       }
    });

    it("check task result", (done) => {
      updateBaseMailTemplatesLogic.doUpdate({ skipLogs: true }).then(function() {

         doCheck().then(function() {
           done();
         }, function(error){
           done(error);
         });

         function doCheck() {
           let deferred = q.defer();
           let filesInfo = updateBaseMailTemplatesLogic.getTemplateFilesInfo(path);

           checkContents(filesInfo, path).then(function(data) {
             deferred.resolve();
           }, function(error) {
             deferred.reject(error);
           });

           return deferred.promise;
         }

         function checkContents(filesInfo, filesPath) {
           let deferred = q.defer();

           async.map(Object.keys(filesInfo), function(category, callback) {
             checkContent(filesPath + filesInfo[category], category).then(function(data) {
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
               models.MailTemplateBase.find({ where: { category: category } }).then(function(baseData) {
                 if(baseData.content == fileData) {
                   models.MailTemplate.find({ where: { MailTemplateBaseId: baseData.id, isCopy: null, AccountId: null, sessionId: null } }).then(function(data) {
                     if(data.content == fileData) {
                       deferred.resolve();
                     } else {
                       deferred.reject("Failed email template for " + category);
                     }
                   }, function(error) {
                     deferred.reject(error);
                   });
                 } else {
                   deferred.reject("Failed base email template for " + category);
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
