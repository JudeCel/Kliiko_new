'use strict';

var fs = require("fs");
var zip = require("node-native-zip");
var q = require('q');
var _ = require('lodash');
var config = require('config');
var models = require('./../../models')
var account = models.Account;
var Resource = models.Resource;
var config = require('config');
var expressValidatorStub = require('../../chatRoom/helpers/expressValidatorStub.js');
var updateTmpTitle = require('../../chatRoom/handlers/updateTmpTitle.js');
var deleteResource = require('../../chatRoom/handlers/deleteResource.js');
var socketHelper = require("../../chatRoom/socketHelper");

module.exports = {
  getResources: getResources,
  downloadResources: downloadResources,
  deleteResources: deleteResources,
  uploadResource: uploadResource,
  saveYoutubeData: saveYoutubeData,
  uploadResourceFile: uploadResourceFile,
  deleteZipFile: deleteZipFile
};

const allTypes = ['image', 'video', 'youtubeUrl', 'audio', 'pdf', 'brandLogo'];
const allowedTypesForZip = ['audio', 'image', 'pdf', 'video', 'brandLogo'];

function getResources(accountId, accountRoles, type){
  let deferred = q.defer();
  let types = "";

  if(type == ""){
    types = allTypes;
  }else{
    types = type;
  }

  let where = { resourceType: types };
  if(!_.includes(accountRoles, 'admin')) {
    where.private = false;
  }

  Resource.findAll({
    where: where,
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

function generateFileName() {
  return "resources_" + Math.round(+new Date()/1000) + ".zip";
}

function deleteZipFile(params) {
  let deferred = q.defer();

  fs.unlink(config.get("chatUploadDir") + params.fileName,  function(err) {
    if(err){
      deferred.reject({error: "was not able to delete"});
    }else{
      deferred.resolve({message: params.fileName});
    }
  });

  return deferred.promise;
}

function downloadResources(data){
  let deferred = q.defer();
  Resource.findAll({
    where: {id: data.resource_id },
    attributes: ['id', 'JSON', 'resourceType']
  })
  .then(function (results) {
    selectFilesForZip(results).then(function(files) {
      pushFilesToZip(files).then(function(fileName) {
        deferred.resolve({fileName: fileName});
      }, function(err) {
        deferred.reject({error: err});
      })
    })
  })
  .catch(function (err) {
    deferred.reject(err);
  });

  return deferred.promise;
}

function selectFilesForZip(results){
  let deferred = q.defer();
  let files = [];

  results.forEach(function(resource, index, array) {
    resource.JSON = JSON.parse(decodeURI(resource.JSON));
    if(allowedTypesForZip.indexOf(resource.resourceType) > -1){
      files.push({
        name: resource.JSON.name,
        path: config.get("chatUploadDir") + resource.JSON.name
      })
    }
    deferred.resolve(files);
  });

  return deferred.promise;
}

function pushFilesToZip(files) {
  let deferred = q.defer();
  let archive = new zip();

  archive.addFiles(files, function (err) {
    if(err){
      deferred.reject("Something went wrong. Please try again latter.");
    }else{
      let buff = archive.toBuffer();
      let fileName = generateFileName();
      fs.writeFile(config.get("chatUploadDir") + fileName, buff, function (err) {
        if(err){
          deferred.reject(err);
        }else{
          deferred.resolve(fileName);
        }
      });
    }
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
  let preFix = '<iframe src="http://www.youtube.com/embed/';
  let subFix = '" frameborder="0" allowfullscreen></iframe>';

  let position = -1;

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
  let url = data.body.text;
  let youTubeLink = processYouTubeData(data.body.text);

  if(youTubeLink == null){
    deferred.reject("You have input an invalid youTube link! Please re-enter.");
  }else{
    let resourceAppendedCallback = function (userId, json) {
      deferred.resolve(json);
    };

    let topicId = 1; //THIS NEEDS to be changed
    let json = {
      private: data.body.private,
      title: data.body.title,
      message: youTubeLink,
      url: url
    };

    socketHelper.updateResources(topicId, data.user.id, json, "youtubeUrl", resourceAppendedCallback);
  }

  return deferred.promise;
}

function uploadResource(data){
  let deferred = q.defer();

  let req = expressValidatorStub({
    params: {
      private: data.body.private,
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

function uploadResourceFile(req) {
  let deferred = q.defer();

  socketHelper.uploadResource({
    private: req.body.private,
    file: req.file,
    width: 950,
    height: 460,
    type: req.body.type,
    resCb: function(userId, json) {
      deferred.resolve(json);
    }
  });
  return deferred.promise;
}
