'use strict';

// This service is only for tasks, db reset or to read default resources !!!
// Don't use it to modify data from other places !!!

var models = require('./../models');
var Bluebird = require('bluebird');
var Constants = require('./../util/constants');

module.exports = {
  addDefaultTopicVideo: addDefaultTopicVideo,
  getDefaultVideo: getDefaultVideo
};

function defaultTopicVideoParams(accountUser, video, type) {
  return {
    accountId: accountUser.AccountId, 
    accountUserId: accountUser.id, 
    stock: true,
    scope: "videoService", 
    source: video.source, 
    link: video.link,
    name: "Default " + type + " Video",
    link: video.link,
    status: "completed",
    type: "link",
    source: video.source
  }
}

function addDefaultTopicVideo(accountUser, video, type) {
  return new Bluebird((resolve, reject) => {
    let params = defaultTopicVideoParams(accountUser, video, type);
    models.Resource.create(params).then(function(res) {
      resolve(res);
    },function(error) {
      reject(error);
    });
  });
}

function getDefaultVideo(type) {
  return new Bluebird((resolve, reject) => {
    let video = null;
    switch (type) {
      case "forum": 
        video = Constants.defaultTopic.video.forum;
        break;
      case "focus": 
        video = Constants.defaultTopic.video.focus;
        break;
      default:
        break;
    }
    if (video != null) {
      models.Resource.find({ where: { scope: "videoService", source: video.source, link: video.link, stock: true } }).then(function(res) {
        resolve(res);
      }, function(error) {
        reject(error);
      });
    } else {
      resolve(null);
    }
  });
}
