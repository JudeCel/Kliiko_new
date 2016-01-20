'use strict';

var q = require('q');
var mv = require('mv');
var fs = require('fs');
var sizeOf = require('image-size');
var multer = require('multer');
var async = require('async');
var _ = require('lodash');
var querystring = require('querystring');
var request = require('request');


var models = require('./../../models')
var account = models.Account;
var Resource = models.Resource;
var updateTmpTitle = require('../../chatRoom/handlers/updateTmpTitle.js');
var uploadNewResource = require('../../chatRoom/socketHelper/saveResourceToDb.js');

module.exports = {
  getResources: getResources,
  downloadResources: downloadResources,
  deleteResources: deleteResources,
  uploadResource: uploadResource,
  validate: validate
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

function deleteResources(ids){
  let deferred = q.defer();

  Resource.destroy({ where: ids})
    .then(function(result) {
      deferred.resolve(ids);
    }
  ).catch(function(err) {
    deferred.reject(err);
  });

  console.log("1111111111111111111111111111111111111111111111111111111111111111111");
  console.log(deferred.promise);
  console.log("1111111111111111111111111111111111111111111111111111111111111111111");
  return deferred.promise;
}

function downloadResources(ids){
  let deferred = q.defer();


  return deferred.promise;
}

function validate(data) {
  let deferred = q.defer();

  let req = {
              params: {
                userId: data.userId,
                // topicId: null,
                URL: "url",
                JSON: {
                  title: data.title,
                  text: data.text
                }
              }
           };

  updateTmpTitle.validate(req, function (err) {
    if( err ){
      deferred.reject(err);
    }else{
      deferred.resolve(null);
    };
  });

  return deferred.promise;
}

function uploadResource(req, res){

}
