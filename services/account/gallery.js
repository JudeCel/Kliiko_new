'use strict';

var q = require('q');
var mv = require('mv');
var fs = require('fs');
var sizeOf = require('image-size');
var multer = require('multer');
var async = require('async');
var _ = require('lodash');

var account = require('./../../models').Account;
var gallery = require('./../../models').Resource;

module.exports = {
  getResources: getResources,
  downloadResources: downloadResources,
  deleteResources: deleteResources
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

function getResources(account_id){
  let deferred = q.defer();

  console.log("1111111111111111111111111111111111111111111111111111111111111111111");
  console.log(account_id);
  console.log("                          get all resources                        ");
  console.log("1111111111111111111111111111111111111111111111111111111111111111111");

  // gallery.findAll({
  //     where: { accountId: account_id }
  //   })
  //   .then(function (result) {
  //     deferred.resolve(result);
  //   })
  //   .catch(function (err) {
  //     deferred.reject(err);
  //   });

  deferred.resolve("NOIS");
  return deferred.promise;
}

function deleteResources(ids){
  let deferred = q.defer();

  console.log("1111111111111111111111111111111111111111111111111111111111111111111");
  console.log("                          Mass delete                              ");
  console.log("1111111111111111111111111111111111111111111111111111111111111111111");

    deferred.resolve("NOIS");
  return deferred.promise;
}

function downloadResources(ids){
  let deferred = q.defer();

  console.log("1111111111111111111111111111111111111111111111111111111111111111111");
  console.log(ids);
  console.log("                          Mass download                            ");
  console.log("1111111111111111111111111111111111111111111111111111111111111111111");

    deferred.resolve("NOIS");
  return deferred.promise;
}

function uploadNew(params){
  let deferred = q.defer();

  console.log("1111111111111111111111111111111111111111111111111111111111111111111");
  console.log("                          Upload                              ");
  console.log("1111111111111111111111111111111111111111111111111111111111111111111");

  // let file = params.file || null;
  // let uploadType = params.uploadType;
  // let youtubeUrl = params.url || null;

  // validate(uploadType, file, youtubeUrl, function(err) {
  //   if (err) {
  //     deferred.reject(err);
  //   }else{
  //     var fileNameToSave = bannerType+'.'+filename.extension;

  //     fs.stat(file.path, function (err, stat) {
  //       if(stat) {
  //         mv(file.path, 'public/gallery/'+fileNameToSave, function(error) {
  //         });
  //       }

  //       // createOrUpdate({ page: bannerType, filepath: 'banners/'+fileNameToSave }, function(error, result) {
  //       //   if (error) {
  //       //     deferred.reject(error);
  //       //     return deferred.promise;
  //       //   }
  //       //   deferred.resolve(result);
  //       // });

  //     deferred.resolve("NOIS");
  //     });
  //   }
  // });

  // return deferred.promise;
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

