'use strict';

var q = require('q');
var mv = require('mv');
var fs = require('fs');
var sizeOf = require('image-size');
var multer = require('multer');
var async = require('async');
var _ = require('lodash');

var account = require('./../../models').Account;
var gallery = require('./../../models').Gallery;

module.exports = {
  findAllRecords: findAllRecords,
  uploadNew: uploadNew
};

// ['image', 'brandLogo', 'audio', 'youtubeLink', 'pdf']

const MEGABYTE = 1024*1024;
const VALIDATIONS = {
  maxSize: 5, // 5mb
  imageFileTypes: [
    'image/gif',
    'image/png',
    'image/jpg',
    'image/jpeg',
    'image/bmp'
  ],
  brandLogoFileTypes: [
    'image/png',
    'image/jpg',
    'image/jpeg'
  ],
  audioFileTypes: [
    'MP3', 'WAV', 'AAC', 'OGG', 'WMA', 'AIFF', 'FLAC', 'ALAC', 'WMA'
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
  let file = params.file;
  let uploadType = params.uploadType;
  // let filename = parseFileName(file.name);

  validate(file, uploadType, function(err) {
    if (err) {
      deferred.reject(err);
    }else{

    }

    return deferred.promise;
  });

  function validate(type, file, callback) {
    let errors = [];

    if(file.size > (VALIDATIONS.maxSize * MEGABYTE)) {
      let errorMessage = 'This file is too big. Allowed size is ' + VALIDATIONS.maxSize + 'MB.';
      errors.push({errorMessage:errorMessage});
      return callback(errors);
    }
  }

  // validate(filename.fullName, file, function(err) {
  //   if (err) {
  //     fs.stat(file.path, function (err, stat) {
  //       if(stat) {
  //         fs.unlink(file.path);
  //       }
  //     });
  //     deferred.reject(err);
  //     return deferred.promise;
  //   }
  //   else {

  //     let fileNameToSave = bannerType+'.'+filename.extension;

  //     fs.stat(file.path, function (err, stat) {
  //       if(stat) {
  //         mv(file.path, 'public/banners/'+fileNameToSave, function(error) {
  //         });
  //       }

  //       createOrUpdate({ page: bannerType, filepath: 'banners/'+fileNameToSave }, function(error, result) {
  //         if (error) {
  //           deferred.reject(error);
  //           return deferred.promise;
  //         }
  //         deferred.resolve(result);
  //       });

  //       return deferred.promise;

  //     });
  //   }
  // });

  // return deferred.promise;

  // if(_.isEmpty(files)) {
  //   return callback('No files selected');
  // }

  // let errors = {},
  // results = {};

  // async.forEachOf(files, function (value, filename, cb) {
  //   let fileData = value;
  //   eachFile(fileData, fileData.filename, function(err, result) {
  //     if(err) {
  //       errors[filename] = err[filename];
  //     }
  //     else {
  //       results[filename] = result;
  //     }
  //     cb();
  //   });
  // }, function(err) {
  //   if(err) {
  //     callback(err);
  //   }
  //   else {
  //     if(_.isEmpty(errors)) {
  //       callback(null, 'Successfully uploaded file.');
  //     }
  //     else {
  //       errors.message = 'Something went wrong with the file.';
  //       callback(errors);
  //     }
  //   }
  // });
}

/**
 * Brake file name to name and extension parts
 * @param fileName {string}
 * @returns {{extension: string, name: string, fullName: string}}
 */
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


