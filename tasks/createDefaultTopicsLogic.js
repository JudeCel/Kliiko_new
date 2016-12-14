'use strict';

var models = require("../models");
var topicsService  = require('./../services/topics');
var MessagesUtil = require('./../util/messages');
let Bluebird = require('bluebird');

function createDefaultTopics() {
  return new Bluebird(function (resolve, reject) {
    models.Account.findAll().then(function(accounts) {
      Bluebird.each(accounts, (account) => {
        return new Bluebird(function (resolve, reject) {
          models.Topic.find({where: { accountId: account.id, default: true } }).then(function(defaultTopic) {
            if (!defaultTopic) {
              topicsService.createDefaultForAccount({ accountId: account.id, name: 'Getting Started', boardMessage: MessagesUtil.topics.defaultTopicBillboardText }, null).then(function() {
                resolve();
              }, function(error) {
                reject(error);
              });
            }
          }, function(error) {
            reject(error);
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

module.exports = {
  createDefaultTopics: createDefaultTopics
}
