"use strict";
var multer = require('multer');
var config = require('config').get('chatConf');
var fs = require('fs');
var _ = require("lodash");

const MEGABYTE = 1024*1024;
const VALIDATIONS = {
  maxSize: 2, // 2mb
  fileTypes: [
    'image/gif',
    'image/png',
    'image/jpg',
    'image/jpeg',
    'image/bmp',
    'audio/mpeg',
    'audio/mp3',
    'application/pdf'
  ]
}

module.exports = function upload(options) {
  options = options || {}
  let storage = multer.diskStorage({
    destination: destination(options),
    fileFilter: fileFilter,
    filename: filename
  });

  let upload =  multer({ storage: storage, limits: { fieldSize: VALIDATIONS.maxSize * MEGABYTE } });
  return upload.single('uploadedfile');
}

function fileFilter(req, file, cb) {
  if (_.includes(VALIDATIONS.fileTypes, req.headers['content-type'])) {
    cb(null, true);
  }else {
    cb(new Error(req.headers['content-type'] +' are not allowed'));
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