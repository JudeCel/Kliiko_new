'use strict';

var fs = require('fs');
var sizeOf = require('image-size');
var multer = require('multer');
var TemplateBanner = require('./../models').TemplateBanner;

var megaByte = 1024*1024;
var validations = {
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

function write(files, callback) {
  if(Object.keys(files).length == 0)
  {
    callback(null, 'No files selected or not an image');
    return;
  }

  let array = [],
      size = Object.keys(files).length;

  for(let filename in files) {
    let file = files[filename][0],
        errors = validate(filename, file);

    if(errors)
    {
      fs.unlink(file.path);
      callback(errors, 'Something went wrong');
      return;
    }
    else
    {
      let newpath = file.destination + '/' + file.originalname;
      fs.rename(file.path, newpath);

      createOrUpdate({page: filename, filepath: 'banners/' + file.originalname}, function (error, result) {
        if(error)
        {
          callback(error, 'Something went wrong');
          return;
        }
        else
        {
          array.push(result);
          if(array.length == size)
            callback(errors, 'Successfully uploaded banner', array);
        }
      });
    }
  }
}

function destroy(page, callback) {
  TemplateBanner.find({
    where: { page: page }
  })
  .then(function (result) {
    let path = 'public/' + result.dataValues.filepath;
    fs.stat(path, function (err, stats) {
      if(stats)
      {
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

function uploadFields() {
  let storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/banners')
    },
    filename: function (req, file, cb) {
      let re = /(?:\.([^.]+))?$/;
      let extension = '.' + re.exec(file.originalname)[1];
      file.originalname = file.fieldname + extension;
      cb(null, file.fieldname + '_temp' + extension);
    }
  })
  let fileFilter = function (req, file, cb) {
    cb(null, !(validations.fileTypes.indexOf(file.mimetype) == -1)); // filters file type
  }

  let upload = multer({ storage: storage, limits: { fieldSize: validations.maxSize * megaByte }, fileFilter: fileFilter });

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
  return { title: 'Upload banner', error: error, message: message, banners: {} };
}

//Helpers
function createOrUpdate(params, callback) {
  TemplateBanner.findOrCreate({
    where: { page: params.page },
    defaults: params
  }).spread(function(templateBanner, created) {
    if(created == false)
    {
      templateBanner.update(params, { where: { page: params.page } })
      .then(function (result) {
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

function validate(type, file) {
  let error = {};

  if(file.size > validations.maxSize * megaByte)
  {
    error[type] = 'This file is too big. Allowed size is ' + validations.maxSize + 'MB.';
    return error;
  }

  let image_size = sizeOf(file.path);
  if(image_size.width > validations.maxWidth || image_size.height > validations.maxHeight)
  {
    error[type] = 'File size is out of range. Allowed size is ' + validations.maxWidth + 'x' + validations.maxHeight + 'px.';
    return error;
  }
}

function mapJson(array) {
  let json = {};
  for(let index in array) {
    let entry = array[index];
    json[entry.dataValues.page] = entry.dataValues.filepath;
  };

  return json;
}

module.exports = {
  profilePage: profilePage,
  write: write,
  destroy: destroy,
  findAllBanners: findAllBanners,
  uploadFields: uploadFields,
  simpleParams: simpleParams
}
