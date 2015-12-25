'use strict';

var q = require('q');
var mv = require('mv');
var fs = require('fs');
var sizeOf = require('image-size');
var multer = require('multer');
var async = require('async');
var _ = require('lodash');
var TemplateBanner = require('./../models').TemplateBanner;


module.exports = {
  profilePage: profilePage,
  write: write,
  destroy: destroy,
  findAllBanners: findAllBanners,
  uploadFields: uploadFields,
  simpleParams: simpleParams,
  saveLink: saveLink
};



const MEGABYTE = 1024*1024;
const VALIDATIONS = {
  maxSize: 5, // 5mb
  maxWidth: 768,
  maxHeight: 200,
  fileTypes: [
    'image/gif',
    'image/png',
    'image/jpg',
    'image/jpeg',
    'image/bmp'
  ]
};

//Exported
function profilePage(callback) {
  TemplateBanner.find({
    where: { page: 'profile' }
  })
  .then(function (result) {
    callback(null, result);
  })
  .catch(function (err) {
    callback(err);
  });
}

// DEPRECATED WRITE
function write_DEPRECATED(files, callback) {
  if(_.isEmpty(files)) {
    return callback('No files selected');
  }

  let errors = {},
      results = {};

  async.forEachOf(files, function (value, filename, cb) {
    let file = value[0];
    eachFile(file, filename, function(err, result) {
      if(err) {
        errors[filename] = err[filename];
      }
      else {
        results[filename] = result;
      }
      cb();
    });
  }, function(err) {
    if(err) {
      callback(err);
    }
    else {
      if(_.isEmpty(errors)) {
        callback(null, 'Successfully uploaded banner.');
      }
      else {
        errors.message = 'Something went wrong with some of the banners.';
        callback(errors);
      }
    }
  });
}



// angular adjusted
function write(file, bannerType) {
  var deferred = q.defer();

  var filename = parseFileName(file.name);


  validate(filename.fullName, file, function(err) {
    if (err) {
      fs.stat(file.path, function (err, stat) {
        if(stat) {
          fs.unlink(file.path);
        }
      });
      deferred.reject(err);
      return deferred.promise;
    }
    else {

      var fileNameToSave = bannerType+'.'+filename.extension;

      fs.stat(file.path, function (err, stat) {
        if(stat) {
          mv(file.path, 'public/banners/'+fileNameToSave, function(error) {
          });
        }

        createOrUpdate({ page: bannerType, filepath: 'banners/'+fileNameToSave }, function(error, result) {
          if (error) {
            deferred.reject(error);
            return deferred.promise;
          }
          //callback(error, result);
          deferred.resolve(result);
        });

        return deferred.promise;

      });
    }
  });

  return deferred.promise;




  if(_.isEmpty(files)) {
    return callback('No files selected');
  }

  let errors = {},
    results = {};

  async.forEachOf(files, function (value, filename, cb) {
    let fileData = value;
    eachFile(fileData, fileData.filename, function(err, result) {
      if(err) {
        errors[filename] = err[filename];
      }
      else {
        results[filename] = result;
      }
      cb();
    });
  }, function(err) {
    if(err) {
      callback(err);
    }
    else {
      if(_.isEmpty(errors)) {
        callback(null, 'Successfully uploaded banner.');
      }
      else {
        errors.message = 'Something went wrong with some of the banners.';
        callback(errors);
      }
    }
  });
}




function destroy_DEPRECATED(page, callback) {
  TemplateBanner.find({
    where: { page: page }
  })
  .then(function (result) {
    let path = 'public/' + result.dataValues.filepath;
    fs.stat(path, function (err, stats) {
      if(stats) {
        fs.unlink(path);
      }
    });
    result.destroy().then(function () {
      callback(null);
    });
  })
  .catch(function (err) {
    callback(err);
  });
}

function destroy(page) {
  var deferred = q.defer();


  TemplateBanner.find({
      where: { page: page }
    })
    .then(function (result) {
      let path = 'public/' + result.dataValues.filepath;
      fs.stat(path, function (err, stats) {
        if(stats) {
          fs.unlink(path);
        }
      });
      result.destroy().then(function (resp) {
        deferred.resolve(resp);
      });
    })
    .catch(function (err) {
      deferred.reject(err);
    });

  return deferred.promise;
}

function uploadFields() {
  let storage = multer.diskStorage({
    destination: function (req, file, cb) {
      let path = 'public/banners';
      fs.stat(path, function (err, stats) {
        if(!stats) {
          fs.mkdir(path);
        }
        cb(null, path);
      });
    },
    filename: function (req, file, cb) {
      let re = /(?:\.([^.]+))?$/;
      let extension = '.' + re.exec(file.originalname)[1];
      file.originalname = file.fieldname + extension;
      cb(null, file.fieldname + '_temp' + extension);
    }
  });

  let upload = multer({ storage: storage, limits: { fieldSize: VALIDATIONS.maxSize * MEGABYTE } });

  return upload.fields([
    { name: 'profile', maxCount: 1 },
    { name: 'sessions', maxCount: 1 },
    { name: 'resources', maxCount: 1 }
  ]);
}

function findAllBanners(callback) {
  TemplateBanner.findAll()
  .then(function (result) {
    callback(mapJson(result));
  });
}

function simpleParams(error, message) {
  if(typeof error == 'string') {
    error = { message: error };
  }

  return { title: 'Upload banner', error: error, message: message, banners: {} };
}

function saveLink(page, link) {
  var deferred = q.defer();

  TemplateBanner.find({
    where: { page: page }
  }).then(function(result) {
    result.update( { link: link } )
      .then(function (_result) {
        deferred.resolve(_result);
      })
      .catch(function (error) {
        deferred.reject(error);
      });
  }).catch(function (error) {
    deferred.reject(error);
  });
  return deferred.promise;
}

//Helpers
function newFilePath(file) {
  return file.destination + '/' + file.originalname;
}

function createOrUpdate(params, callback) {
  TemplateBanner.findOrCreate({
    where: { page: params.page },
    defaults: params
  }).spread(function(templateBanner, created) {
    if(created == false)
    {
      templateBanner.update(params, { where: { page: params.page } })
      .then(function (_result) {
        callback(null, params);
      })
      .catch(function (error) {
        callback(error);
      });
    }
    else
    {
      callback(null, params);
    }
  }).catch(function (error) {
    callback(error);
  });
}

function validate_DEPRECATED(type, file, callback) {
  let error = {};

  sizeOf(file.path, function(err, dimensions) {
    if(err || !isValidFileType(file.mimetype)) {
      error[type] = 'Only image files are allowed - ' + allowedImageTypes() + '.';
      return callback(error);
    }

    if((dimensions.width > VALIDATIONS.maxWidth) || (dimensions.height > VALIDATIONS.maxHeight)) {
      error[type] = 'File size is out of range. Allowed size is ' + VALIDATIONS.maxWidth + 'x' + VALIDATIONS.maxHeight + 'px.';
      return callback(error);
    }
    else {
      return callback(null);
    }
  });

  if(file.size > (VALIDATIONS.maxSize * MEGABYTE)) {
    error[type] = 'This file is too big. Allowed size is ' + VALIDATIONS.maxSize + 'MB.';
    return callback(error);
  }
}

function validate(type, file, callback) {
  let error = {};

  sizeOf(file.path, function(err, dimensions) {
    if(err || !isValidFileType(file.type)) {
      error[type] = 'Only image files are allowed - ' + allowedImageTypes() + '.';
      return callback(error);
    }

    if((dimensions.width > VALIDATIONS.maxWidth) || (dimensions.height > VALIDATIONS.maxHeight)) {
      error[type] = 'File size is out of range. Allowed size is ' + VALIDATIONS.maxWidth + 'x' + VALIDATIONS.maxHeight + 'px.';
      return callback(error);
    }
    else {
      return callback(null);
    }
  });

  if(file.size > (VALIDATIONS.maxSize * MEGABYTE)) {
    error[type] = 'This file is too big. Allowed size is ' + VALIDATIONS.maxSize + 'MB.';
    return callback(error);
  }
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





function mapJson(array) {
  let json = {};
  for(let index in array) {
    let entry = array[index];
    json[entry.dataValues.page] = entry.dataValues;
  }

  return json;
}

function isValidFileType(type) {
  return (VALIDATIONS.fileTypes.indexOf(type) > -1);
}

function allowedImageTypes() {
  let array = [];
  for(let i=0; i < VALIDATIONS.fileTypes.length; i++) {
   array[i] = VALIDATIONS.fileTypes[i].replace(/image\//g, ' ');
  }
  return array;
}

function eachFile(file, filename, callback) {
  validate(filename, file, function(err) {
    if(err) {
      fs.stat(file.path, function (err, stat) {
        if(stat) {
          fs.unlink(file.path);
        }
      });
      callback(err);
    }
    else {
      fs.stat(file.path, function (err, stat) {
        if(stat) {
          fs.rename(file.path, newFilePath(file));
        }
        createOrUpdate({ page: filename, filepath: 'banners/' + file.originalname }, function(error, result) {
          callback(error, result);
        });
      });
    }
  });
}

