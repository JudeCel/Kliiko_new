"use strict";
var webFaultHelper = require('../helpers/webFaultHelper.js');
var uploadResourceCallback = require('./saveResourceToDb.js');
var fs = require('fs');
var config = require('config').get('chatConf');
var im = require('imagemagick');
var joi = require("joi");
var _ = require("lodash")
var async = require('async');

//use PATH for imagemagick instead set
im.convert.path = config.paths.convertPath;
im.identify.path = config.paths.identifyPath;

const gallery = {
  panel: {
    width: 420,
    height: 420,
    version: "panel"
  },
  table: {
    width: 84,
    height: 84,
    version: "table"
  }
};

function saveResourceToDisk(params) {
  let err = joi.validate(params, {
    file: joi.object().required(),
    resCb: joi.func().required(),
    private: joi.boolean().optional(),
    width: joi.number().optional(),
    height: joi.number().optional(),
    type: joi.string().optional()
  });

  if (err.error){
    throw webFaultHelper.getValidationFault(err.error);
  }

  let json = {
    filename: params.file.filename,
  };

  let filename = json.filename;
  let path = params.file.path;
  let fileFormat = getFileType(params.file.mimetype);
  fs.readFile(path, function (err) {
    if (err) {
    } else {
      /*
      the file saved nicely...
      now lets make sure we resize it to a more friendly size
      afterwards, we'll look at the image to see it's dimensions and so on...
      */
      if (params.width && params.height) {
        im.identify(path, function(err, features) {
          if (err)
            if(err.arguments!=null){
              im.identify(['-strip', path], function(err, features) {
                if (err){
                  console.log(err);
                  uploadResourceCallback({
                    name: filename,
                    matchName: json.filename,
                    type: params.type,
                    format: fileFormat,
                    width: params.width,
                    height: params.height,
                    depth: 1
                  }, params.resCb);
                }else{
                  stage2ofWriteFile(features);
                }
              });
            }else{
              console.log("ERROR: Imagemagick is unable to identify this file type  "+err);
              uploadResourceCallback({
                name: filename,
                matchName: json.filename,
                type: params.type,
                format: fileFormat,
                width: params.width,
                height: params.height,
                depth: 1
              }, params.resCb);
          } else stage2ofWriteFile(features);

          function stage2ofWriteFile(features){
            if(features.width < params.width && features.height < params.height){
              params.width = features.width;
              params.height = features.height;
            }
            resizeToAllSizes(params, gallery, filename, fileFormat, features);
          }
        });

      } else {   //  process other types of files
        uploadResourceCallback({
          name: filename,
          matchName: json.filename,
          type: params.type,
          format: fileFormat
        }, params.resCb);
      }
    }
  });

}

function resizeToAllSizes(params, gallery, filename, fileFormat, features) {
  async.parallel({
    default: function(callback) {
      resize(params.file, features.width, features.height, "", callback)
    },
    panel: function(callback) {
      resize(params.file, gallery.panel.width, gallery.panel.height, gallery.panel.version, callback)
    },
    table: function(callback) {
      resize(params.file, gallery.table.width, gallery.table.height, gallery.table.version, callback)
    }
  }, function(err, results) {
    uploadResourceCallback({
      name: filename,
      matchName: filename,
      type: params.type,
      format: fileFormat,
      width: features.width,
      height: features.height,
      depth: features.depth,
      panelThumb: results.panel,
      tableThumb: results.table
    }, params.resCb);
  });
}

function resize(file, width, height, version, callback) {
  let filename = version + "_" + file.originalname
  let saveUrl = file.destination + filename;
  let returnPath = _.trim(saveUrl);

  im.identify(file.path, function(err, features) {
    if(err){
      callback("ERROR: Imagemagick is unable to identify this file type  "+err);
    }else{
      im.resize({
        srcPath: file.path,
        dstPath: saveUrl,
        width: width,
        height: height
      }, function (err, stdout, stderr) {
        if(err){
          callback(err);
        }else{
          callback(null, filename);
        }
      });
    }
  });
}

function getFileType(string) {
  return string.split('/').pop()
}

module.exports = saveResourceToDisk;
