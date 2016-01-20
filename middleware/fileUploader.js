"use strict";
var multer = require('multer');
var config = require('config').get('chatConf');
var fs = require('fs');

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
}

module.exports = function upload(options) {
  options = options || {}
  let storage = multer.diskStorage({
    destination: function (req, file, cb) {
      let path = (options.path || config.paths.fsPath + "/" + 'public/uploads/')
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
      cb(null, file.fieldname + extension);
    }
  });

  let upload =  multer({ storage: storage });
  return upload.single('uploadedfile')
}
