'use strict';

var fs = require("fs");
var zip = require("node-native-zip");
// var Zip = require("adm-zip");
var q = require('q');
var models = require('./../../models')
var account = models.Account;
var Resource = models.Resource;
var expressValidatorStub = require('../../chatRoom/helpers/expressValidatorStub.js');
var updateTmpTitle = require('../../chatRoom/handlers/updateTmpTitle.js');
var deleteResource = require('../../chatRoom/handlers/deleteResource.js');
var socketHelper = require("../../chatRoom/socketHelper");

module.exports = {
  getResources: getResources,
  downloadResources: downloadResources,
  deleteResources: deleteResources,
  uploadResource: uploadResource,
  saveYoutubeData: saveYoutubeData
};

function getResources(accountName){
  let deferred = q.defer();
  let accountId = 3;

  Resource.findAll({
    include: [{
        model: models.User, 
        include: [{
          model: models.Account,
          where: { id: accountId }
        }]
      }],
      attributes: ['id', 'userId', 'thumb_URL', 'URL', 'HTML', 'JSON', 'resourceType']
  })
  .then(function (results) {
    results.forEach(function(resource, index, array) {
      delete resource.dataValues.User;
      resource.JSON = JSON.parse(decodeURI(resource.JSON));
    });
    deferred.resolve(results);
  })
  .catch(function (err) {
    deferred.reject(err);
  });
  return deferred.promise;
}


function downloadResources(data){
  let deferred = q.defer();

  Resource.findAll({
    id: data.resource_id,
    attributes: ['id', 'JSON', 'resourceType']
  })
  .then(function (results) {
    let uniqueIdentifier = Math.round(+new Date()/1000);
    let archive = new zip();
    let files = [];

    results.forEach(function(resource, index, array) {
      resource.JSON = JSON.parse(decodeURI(resource.JSON));
      if(['audio', 'image', 'pdf'].indexOf(resource.resourceType) > -1){
        files.push({
          name: resource.JSON.name,
          path: "/home/lauris/code/Kliiko/chatRoom/public/uploads/" + resource.JSON.name
        })
      }
    });

    archive.addFiles(files, function (err) {
      if (err) return console.log("err while adding files", err);

      let buff = archive.toBuffer();
      let fileName = "resources_" + uniqueIdentifier + ".zip";

      fs.writeFile("/home/lauris/code/Kliiko/chatRoom/public/uploads/" + fileName, buff, function () {
        deferred.resolve({fileName: fileName});
      });
    });

  })
  .catch(function (err) {
    deferred.reject(err);
  });

  return deferred.promise;
}

function deleteResources(ids){
  let deferred = q.defer();

  let req = expressValidatorStub({
    params: ids
  });

  var nextCb = function (err) {
    deferred.reject(err);
  };

  var res = {
    send: function (result) {
      deferred.resolve(result);
    }
  };

  deleteResource.run(req, res, nextCb);
  
  return deferred.promise;
}

// I was not able to include this from utilities.js
function processYouTubeData(youtubeData) {
    var preFix = '<iframe width="420" height="315" src="http://www.youtube.com/embed/';
    var subFix = '" frameborder="0" allowfullscreen></iframe>';

    var position = -1;

    if (youtubeData.search("<iframe") != -1) {
        return youtubeData;
    } else if (youtubeData.search("youtube.com/watch?") != -1) {
        position = youtubeData.search("v=") + 2;
        return preFix + youtubeData.substr(position) + subFix;
    } else if (youtubeData.search("youtu.be/") != -1) {
        position = youtubeData.search("youtu.be/") + 9;
        return preFix + youtubeData.substr(position) + subFix;
    }
    return null;
}

function saveYoutubeData(data) {
  let deferred = q.defer();
  let youTubeLink = processYouTubeData(data.body.text);

  if(youTubeLink == null){
    deferred.reject("You have input an invalid youTube link!/n Please re-enter.");
  }

  let resourceAppendedCallback = function (userId, json) {
    console.log(userId)
    deferred.resolve(json);
  };

  let topicId = 1;
  let json = {
    title: data.body.title,
    message: youTubeLink
  };

  socketHelper.updateResources(topicId, data.user.id, json, "video", resourceAppendedCallback);

  return deferred.promise;
}

function uploadResource(data){
  let deferred = q.defer();

  let req = expressValidatorStub({
    params: {
      userId: data.user.id,
      topicId: 1, //THIS NEEDS to be changed
      URL: "url",
      JSON: {
        title: data.body.title,
        text: data.body.text
      }
    }
  });

  var errorCallback = function (err) {
    deferred.reject(err);
  };

  let successCallback = { send: function(result) {
    deferred.resolve(result);
  }}
  
  updateTmpTitle.validate(req, function (err) {
    if (err){
      return errorCallback(err);
    }else{
      updateTmpTitle.run(req, successCallback, errorCallback);
    }
  });

  return deferred.promise;
}