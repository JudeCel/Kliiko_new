'use strict';
var multer  = require('multer');
var _ = require('lodash');

const MEGABYTE = 1024*1024;
const VALIDATIONS = {
  maxSize: 5,
  fileTypes: [
    'csv',
    'xls'
  ]
};

function fileFilter(req, file, cb) {
  let extension = getFileExtension(file.originalname)
  if (_.includes(VALIDATIONS.fileTypes, extension)) {
    cb(null, true);
  }else {
    cb(new Error(extension + ' files are not allowed.'));
  }
}

function getFileExtension(fileNmae) {
  let re = /(?:\.([^.]+))?$/;
  return re.exec(fileNmae)[1];
}

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, '/tmp');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

module.exports = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: (VALIDATIONS.maxSize * MEGABYTE) } });
