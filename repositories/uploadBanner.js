"use strict";
var fs = require('fs');
var im = require('imagemagick');
var templateBanner = require('./templateBanners');

function write(req, callback) {
  let errors = {};

  for(var filename in req.files) {
    var file = req.files[filename][0];
    // file.filename = file.fieldname;
    // file.path = file.destination + file.fieldname;
    console.log(file);
    validate(filename, file, errors);
  }

  if(Object.keys(errors).length != 0) {
    return callback(errors);
  }

  for(var filename in req.files) {
    templateBanner.createOrUpdate({page: filename, filepath: req.files[filename].filepath}, callback)
  }
  callback(null, "Successfully uploaded", req.user);
}

function validate(type, file, errors) {
  if(file.size > 5*1024*1024) //5mb
  {
    errors[type] =  { size: 'This file is to big.' };
  }
}

module.exports = {
  write: write
}
