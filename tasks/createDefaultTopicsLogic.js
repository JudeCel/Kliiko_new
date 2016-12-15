'use strict';

var models = require("../models");
var topicsService  = require('./../services/topics');
var resourcesService  = require('./../services/resources');
var Constants = require('./../util/constants');
let Bluebird = require('bluebird');

function createDefaultTopics() {
  return new Bluebird(function (resolve, reject) {
    models.Account.findAll().then(function(accounts) {
      Bluebird.each(accounts, (account) => {
        return new Bluebird(function (resolve2, reject2) {
          models.Topic.find({where: { accountId: account.id, default: true } }).then(function(defaultTopic) {
            if (!defaultTopic) {
              topicsService.createDefaultForAccount({ accountId: account.id, name: 'Getting Started', boardMessage: Constants.defaultTopic.billboardText }, null).then(function() {
                resolve2();
              }, function(error) {
                reject2(error);
              });
            } else {
              resolve2();
            }
          }, function(error) {
            reject2(error);
          });
        });
      }).then(function() {
        resolve();
      }, function(error) {
        reject(error);
      });
    }, function(error) {
      reject(error);
    });
  });
}

function createDefaultTopicsVideo() {
  return new Bluebird(function (resolve, reject) {
    models.AccountUser.find({ where: { role: "admin" } }).then(function(accountUser) {
      createDefaultTopicsVideoIfNotExists(accountUser, Constants.defaultTopic.video.focus, "Focus").then(function() {
        createDefaultTopicsVideoIfNotExists(accountUser, Constants.defaultTopic.video.forum, "Forum").then(function() {
          resolve();
        }, function(error) {
          reject(error);
        });
      }, function(error) {
        reject(error);
      });
    }, function(error) {
      reject(error);
    });
  });
}

function createDefaultTopicsVideoIfNotExists(accountUser, video, type) {
  return new Bluebird(function (resolve, reject) {
    models.Resource.find({ where: { accountId: accountUser.AccountId, scope: "videoService", source: video.source, link: video.link, stock: true } }).then(function(res) {
      if (!res) {
        resourcesService.addDefaultTopicVideo(accountUser, video, type).then(function() {
          resolve();
        }, function(error) {
          reject(error);
        });
      } else {
        resolve();
      }
    }, function(error) {
      reject(error);
    });
  });
}

module.exports = {
  createDefaultTopics: createDefaultTopics,
  createDefaultTopicsVideo: createDefaultTopicsVideo,
}
