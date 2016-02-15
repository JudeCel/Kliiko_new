"use strict";
var multer = require('multer');
var config = require('config').get('chatConf');
var fs = require('fs');
var _ = require("lodash");

const MEGABYTE = 1024*1024;
const VALIDATIONS = {
  maxSize: 5, // 2mb
  fileTypes: [
    "gif",
    "png",
    "jpg",
    "jpeg",
    "bmp",
    "mpeg",
    "mp3",
    "mp4",
    "pdf"
  ]
};

module.exports = function upload(options) {
  options = options || {};
  let storage = multer.diskStorage({
    destination: destination(options),
    filename: filename
  });

  let upload =  multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: (VALIDATIONS.maxSize * MEGABYTE) } });
  return function(req, res, next) {
    upload.single('uploadedfile')(req, res, function (err) {
    if (err) {
      res.status(415);
      res.send({error: err.message})
      return
    }
    next();
  })
  }
};

function fileFilter(req, file, cb) {
  let extension = getFileExtension(file.originalname)
  console.log(extension);
  if (_.includes(VALIDATIONS.fileTypes, extension)) {
    cb(null, true);
  }else {
    cb(new Error(extension + ' files are not allowed.'));
  }
}

function filename(req, file, cb) {
  let name = file.originalname.split(".")[0]
  let extension = '.' + getFileExtension(file.originalname)
  cb(null, name + (new Date().getTime()) + extension);
}

function getFileExtension(fileNmae) {
  let re = /(?:\.([^.]+))?$/;
  return re.exec(fileNmae)[1];
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
