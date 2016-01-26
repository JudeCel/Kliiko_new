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

function saveResourceToDisk(params) {

    let err = joi.validate(params, {
        file: joi.object().required(),
        resCb: joi.func().required(),
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
        var filename = json.filename;
        var path = params.file.path;
        var panelThumb = {width: 300, height: 300, version: "panel"}
        var tableThumb = {width: 150, height: 150, version: "table"}
        var fileFormat = params.file.mimetype.split('/').pop();
        
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
                            }
                         else
                         {
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
                         function stage2ofWriteFile(features)
                         {
                             if(features.width < params.width && features.height < params.height){
                                 params.width = features.width;
                                 params.height = features.height;
                             }

                             im.resize({
                                 srcPath: path,
                                 dstPath: path,
                                 width: params.width,
                                 height: params.height
                             }, function (err, stdout, stderr) {
                                 if (err) {
                                     // TODO: deal with error
                                     console.log("Imagemagick: wasn't able to resize");
                                 } //throw err;
                                 else {

                                     if (err) {
                                         console.log("ERROR: Imagemagick is unable to identify this file type  "+err);

                                     } else {
                                        async.parallel({
                                            panel: function(callback) {
                                                resize(params.file, panelThumb.width, panelThumb.height, panelThumb.version, callback)
                                            },
                                            table: function(callback) {
                                                resize(params.file, tableThumb.width, tableThumb.height, tableThumb.version, callback)
                                            }
                                        }, function(err, results) {
                                            uploadResourceCallback({
                                                name: filename,
                                                matchName: json.filename,
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

                                 }
                             });
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

function resize(file, width, height, version, callback) {
    let filename = version + "_" + file.originalname
    let saveUrl = file.destination + filename;
    let returnPath = _.trim(saveUrl);

    im.identify(file.path, function(err, features) {
        im.resize({
            srcPath: file.path,
            dstPath: saveUrl,
            width: width,
            height: height
        }, function (err, stdout, stderr) {
            if(err){
                return callback(err);
            }else{
                return callback(null, filename);
            }
        });
    });
}

module.exports = saveResourceToDisk;