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
var constants = require('../util/constants');
let Bluebird = require('bluebird');
var Minimize = require('minimize');
var MailTemplateService = require('./../services/mailTemplate');

var minimize = new Minimize();

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
    if (fileData) {
      minimize.parse(fileData, function (error, minifiedData) {
        if (error) {
          callback(error);
        } else {
          models.MailTemplateBase.update({ content: minifiedData }, { where: { category: item.category } }).then(function(updateDataBase) {
            models.MailTemplate.update({ content: minifiedData }, { where: { MailTemplateBaseId: item.id, isCopy: null, AccountId: null, sessionId: null } }).then(function(updateData) {
              callback(null, "Updated email template for " + item.category);
            }, function(error) {
              callback(error);
            });
          }, function(error) {
            callback(error);
          });
        }
      });
    }
  });
}

function processCallBack(infoDataObject) {
  return function(item, callback) {
    processData(item, infoDataObject, callback);
  }
}

function addMailTemplate(templateInfo, config) {  
  return new Bluebird(function (resolve, reject) {
    models.MailTemplateBase.find({where: {category: templateInfo.type}}).then(function(mailTemplateBase) {
      if (!mailTemplateBase) {
        createMailTemplateFromFile(templateInfo).then(function() {
          outLog(config, "MailTemplate created: " + templateInfo.name);
          resolve(true);
        }, function(error){
          outLog(config, error);
          reject(error);
        });
      } else {
        outLog(config, "MailTemplate exists: " + templateInfo.name);
        resolve(false);
      }
    }, function(error) {
      outLog(config, error);
      reject(error);
    });
  });
}

function createMailTemplateFromFile(fileInfo) {
  return new Bluebird(function (resolve, reject) {
    let filesInfo = getTemplateFilesInfo(path);

    fs.readFile(path + filesInfo[fileInfo.type], 'utf8', function read(error, fileData) {
      if (error) {
        reject(error);
      } else if (fileData) {
        minimize.parse(fileData, function (error, minifiedData) {
          if (error) {
            reject(error);
          } else {
            let baseMailTemplateAttrs = {
              name: fileInfo.name,
              subject: fileInfo.subject,
              content: minifiedData,
              systemMessage: fileInfo.systemMessage,
              category: fileInfo.type,
              required: fileInfo.required
            };
            MailTemplateService.createBaseMailTemplate(baseMailTemplateAttrs, function (err, mailTemplate) {
              if(err) {
                reject(err);
              } else {
                let mailTemplateAttrs = {
                  name: fileInfo.name,
                  subject: fileInfo.subject,
                  content: minifiedData,
                  systemMessage: fileInfo.systemMessage,
                  required: fileInfo.required,
                  MailTemplateBaseId: mailTemplate.id
                };
                models.MailTemplate.create(mailTemplateAttrs).then(function() {
                  resolve();
                }, function(error) {
                  reject(error);
                });
              }
            });
          }
        });
      }
    });

  });
}

module.exports = {
  doUpdate: doUpdate,
  getTemplateFilesInfo: getTemplateFilesInfo,
  addMailTemplate: addMailTemplate
}
