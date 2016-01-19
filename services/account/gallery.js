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
var uploadNewResource = require('../../chatRoom/socketHelper/saveResourceToDisk.js');

module.exports = {
  getResources: getResources,
  downloadResources: downloadResources,
  deleteResources: deleteResources,
  uploadResource: uploadResource,
  validate: validate
};

// const MEGABYTE = 1024*1024;
// const VALIDATIONS = {
//   maxSize: 5, // 5mb
//   imageFileTypes: [
//     'image/png',
//     'image/jpg',
//     'image/jpeg',
//     'image/bmp'
//   ],
//   audioFileTypes: [
//     'audio/mp3'
//   ],
//   textFileTypes: [
//     'application/pdf'
//   ],
//   videoFileTypes: [
//     'video/ogg',
//     'video/webm',
//     'video/mp4'
//   ]
// };

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

  console.log("1111111111111111111111111111111111111111111111111111111111111111111");
  console.log("                          Mass delete                              ");
  console.log("1111111111111111111111111111111111111111111111111111111111111111111");

  return deferred.promise;
}

function downloadResources(ids){
  let deferred = q.defer();

  console.log("1111111111111111111111111111111111111111111111111111111111111111111");
  console.log(ids);
  console.log("                          Mass download                            ");
  console.log("1111111111111111111111111111111111111111111111111111111111111111111");

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
  let deferred = q.defer();
  let params = {req: req, res: res};

    uploadNewResource.saveResourceToDisk(params, function (result) {
      console.log("66666666666666666666666666666666666666666666666666666666666");
      console.log(result);

    });
  // });
  
  // return deferred.promise;

}

function saveToDatabase(){

}

// function create()

// function validate(type, file, url, callback) {
//   let errors = [];

//   if (type === "video" && url !== null) {
//     if (!isYoutubeVideo(url)) {
//       let errorMessage = "Video URL you provided is invalid, please double check your video it.";
//       errors.push({errorMessage:errorMessage});
//       return callback(errors);
//     }
//   }

//   if(file.size > (VALIDATIONS.maxSize * MEGABYTE)) {
//     let errorMessage = 'This file is too big. Allowed size is ' + VALIDATIONS.maxSize + 'MB.';
//     errors.push({errorMessage:errorMessage});
//     return callback(errors);
//   }

//   if(!isValidFileType(file.mimetype, type)) {
//     let errorMessage = 'Only file extensions for ' + type.replace(/([A-Z])/g, ' $1').toLowerCase() + ' file are allowed -' + allowedTypes(type) + '.';
//     errors.push({errorMessage:errorMessage});
//     return callback(errors);
//   }

//   return callback(null);
// }

// function isValidFileType(mimetype, type) {

//   if(type === 'image' || type === 'brandLogo'){
//     return VALIDATIONS.imageFileTypes.indexOf(mimetype) > -1
//   }

//   if(type === 'audio'){
//     return VALIDATIONS.audioFileTypes.indexOf(mimetype) > -1
//   }

//   if(type === 'text'){
//     return VALIDATIONS.textFileTypes.indexOf(mimetype) > -1
//   }

//   if(type === 'video'){
//     return VALIDATIONS.videoFileTypes.indexOf(mimetype) > -1
//   }

// }

// function allowedTypes(type) {
//   let array = [];

//   if(type === 'image' || type === 'brandLogo'){
//     for(let i=0; i < VALIDATIONS.imageFileTypes.length; i++) {
//      array[i] = VALIDATIONS.imageFileTypes[i].replace(/image\//g, ' ');
//     }
//   }

//   if(type === 'audio'){
//     for(let i=0; i < VALIDATIONS.audioFileTypes.length; i++) {
//      array[i] = VALIDATIONS.audioFileTypes[i].replace(/audio\//g, ' ');
//     }
//   }

//   if(type === 'text'){
//     for(let i=0; i < VALIDATIONS.textFileTypes.length; i++) {
//      array[i] = VALIDATIONS.textFileTypes[i].replace(/application\//g, ' ');
//     }
//   }

//   if(type === 'video'){
//     for(let i=0; i < VALIDATIONS.videoFileTypes.length; i++) {
//      array[i] = VALIDATIONS.videoFileTypes[i].replace(/video\//g, ' ');
//     }
//   }

//   return array;
// }

// function isYoutubeVideo(url){
//   let regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
//   let match = url.match(regExp);
//   if (match && match[2].length == 11) {
//     return true
//   } else {
//     return false
//   }
// }

function parseFileName(fileName) {
  let fileNameArr = fileName.split('.');

  var output = {
    extension: getFileExtension(fileNameArr),
    name: getFileName(fileNameArr),
    fullName: fileName
  };

  return output;

  /**
   * Will return file extension
   *  Example:
   *    return 'png' from '[image-name,this,png]'
   *    return 'jpg' as default from '[image]'
   *
   * @param fileNameArr {array}
   * @returns {string}
   */
  function getFileExtension(fileNameArr) {
    let defaultExtension = 'jpg';
    if (fileNameArr.length === 1 ) return defaultExtension;
    return fileNameArr[ fileNameArr.length - 1];
  }

  /**
   * Return everything but not extension
   * @param fileNameArr [array]
   * @returns {string}
   */
  function getFileName(fileNameArr) {
    let tmp = fileNameArr;
    tmp.splice(tmp.length -1 ,1);
    return tmp.join('.');
  }
}