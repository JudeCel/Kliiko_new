"use strict";
var fs = require('fs');
var templateBanner = require('./templateBanners');
var sizeOf = require('image-size');

function write(req, callback) {
  let errors = {};

  for(var filename in req.files) {
    var file = req.files[filename][0];
    if(validate(filename, file, errors))
    {
      var newpath = file.destination + "/" + file.originalname;
      fs.rename(file.path, newpath);
      templateBanner.createOrUpdate({page: filename, filepath: 'banners/' + file.originalname}, function (error, message) {
        // body...
      });
    }
    else fs.unlink(file.path);
  }

  if(Object.keys(errors).length != 0)
    callback(errors, 'Something went wrong');
  else callback(errors, 'Successfully uploaded files');
}

function validate(type, file, errors) {
  if(file.size > 5*1024*1024) //5mb
  {
    errors[type] = 'This file is too big. Allowed size is 5MB.';
    return false;
  }

  var image_size = sizeOf(file.path);
  if(image_size.width > 768 || image_size.height > 200)
  {
    errors[type] = 'File size is out of range. Allowed size is 768x200px.';
    return false;
  }

  return true;
}

module.exports = {
  write: write
}
