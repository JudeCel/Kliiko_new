'use strict';

var q = require('q');
var models = require('./../../models')
var account = models.Account;
var Resource = models.Resource;
var expressValidatorStub = require('../../chatRoom/helpers/expressValidatorStub.js');
var updateTmpTitle = require('../../chatRoom/handlers/updateTmpTitle.js');
var deleteResource = require('../../chatRoom/handlers/deleteResource.js');

module.exports = {
  getResources: getResources,
  downloadResources: downloadResources,
  deleteResources: deleteResources,
  uploadResource: uploadResource
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


function downloadResources(ids){
  let deferred = q.defer();


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