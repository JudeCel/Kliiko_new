"use strict";
var multer = require('multer');
var config = require('config').get('chatConf');
var fs = require('fs');
var _ = require("lodash");

const MEGABYTE = 1024*1024;
const VALIDATIONS = {
  maxSize: 5, // 2mb
  fileTypes: [
    'gif',
    'png',
    'jpg',
    'jpeg',
    'bmp',
    'mpeg',
    'mp3',
    'pdf'
  ]
};

module.exports = function upload(options) {
  options = options || {};
  let storage = multer.diskStorage({
    destination: destination(options),
    filename: filename
  });

  let upload =  multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: (VALIDATIONS.maxSize * MEGABYTE) } });
  return upload.single('uploadedfile');
};

function fileFilter(req, file, cb) {
  let re = /(?:\.([^.]+))?$/;

  if (_.includes(VALIDATIONS.fileTypes, re.exec(file.originalname)[1])) {
    cb(null, true);
  }else {
    cb(new Error(re.exec(file.originalname)[1] +' are not allowed'));
  }
}

function filename(req, file, cb) {
  let re = /(?:\.([^.]+))?$/;
  let name = file.originalname.split(".")[0]
  let extension = '.' + re.exec(file.originalname)[1];
  cb(null, name + (new Date().getTime()) + extension);
}

function destination(options) {
  return function(req, file, cb) {
    let path = (options.path || config.paths.fsPath + '/public/uploads/');
    fs.stat(path, function (err, stats) {
      if(!stats) {
        fs.mkdir(path);
      }
      cb(null, path);
    });
  }
}
