'use strict';

var q = require('q');
var mv = require('mv');
var fs = require('fs');
var sizeOf = require('image-size');
var multer = require('multer');
var async = require('async');
var _ = require('lodash');

var YouTube = require('youtube-node');
var youTube = new YouTube();
youTube.setKey('AIzaSyDLJ5ZXrc3j2rRyqyjA2-BGHLEX7pDhC0E');

var account = require('./../../models').Account;
var gallery = require('./../../models').Gallery;

module.exports = {
  findAllRecords: findAllRecords,
  uploadNew: uploadNew
};

const MEGABYTE = 1024*1024;
const VALIDATIONS = {
  maxSize: 5, // 5mb
  imageFileTypes: [
    'image/png',
    'image/jpg',
    'image/jpeg',
    'image/bmp'
  ],
  audioFileTypes: [
    'audio/mp3'
  ],
  textFileTypes: [
    'application/pdf'
  ]
};

function findAllRecords(account_id){
  let deferred = q.defer();

  gallery.findAll({
      where: { accountId: account_id }
    })
    .then(function (result) {
      deferred.resolve(result);
    })
    .catch(function (err) {
      deferred.reject(err);
    });

  return deferred.promise;
}

function uploadNew(params){
  let deferred = q.defer();
  let file = params.file || null;
  let uploadType = params.uploadType;
  let youtubeUrl = params.url || null;

  validate(uploadType, file, youtubeUrl, function(err) {
    if (err) {
      // console.log(err);
      deferred.reject(err);
    }else{
      // deferred.resolve("NOIS");
      // return deferred.promise;
    }

  });
  return deferred.promise;
}

function validate(type, file, url, callback) {
  let errors = [];

  if (type === "youtubeLink") {
    if (!youtubeVideoExists(url)) {
      let errorMessage = "Video URL you provided is invalid or the video doesn't exist. Please double check your video URL.";
      errors.push({errorMessage:errorMessage});
      return callback(errors);
    }
  }

  if(file.size > (VALIDATIONS.maxSize * MEGABYTE)) {
    let errorMessage = 'This file is too big. Allowed size is ' + VALIDATIONS.maxSize + 'MB.';
    errors.push({errorMessage:errorMessage});
    return callback(errors);
  }

  if(!isValidFileType(file.mimetype)) {
    let errorMessage = 'Only file extensions for ' + type.replace(/([A-Z])/g, ' $1').toLowerCase() + ' file are allowed -' + allowedTypes(type) + '.';
    errors.push({errorMessage:errorMessage});
    return callback(errors);
  }
}

function isValidFileType(type) {
  if(type === 'image' || type === 'brandLogo'){
    return VALIDATIONS.imageFileTypes.indexOf(type) > -1
  }

  if(type === 'audio'){
    return VALIDATIONS.audioFileTypes.indexOf(type) > -1
  }

  if(type === 'text'){
    return VALIDATIONS.textFileTypes.indexOf(type) > -1
  }
}

function allowedTypes(type) {
  let array = [];

  if(type === 'image' || type === 'brandLogo'){
    for(let i=0; i < VALIDATIONS.imageFileTypes.length; i++) {
     array[i] = VALIDATIONS.imageFileTypes[i].replace(/image\//g, ' ');
    }
  }

  if(type === 'audio'){
    for(let i=0; i < VALIDATIONS.audioFileTypes.length; i++) {
     array[i] = VALIDATIONS.audioFileTypes[i].replace(/audio\//g, ' ');
    }
  }

  if(type === 'text'){
    for(let i=0; i < VALIDATIONS.textFileTypes.length; i++) {
     array[i] = VALIDATIONS.textFileTypes[i].replace(/application\//g, ' ');
    }
  }

  return array;
}

function youtubeVideoExists(url){
  youTube.getById('0f9PGBQlPbI', function(error, result) {
    if (error) {
      return false;
    }
    else {
      let response = JSON.stringify(result, null, 2)
      console.log(response);
    }
  });
  return false
}

