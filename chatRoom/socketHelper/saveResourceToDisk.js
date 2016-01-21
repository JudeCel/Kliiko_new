"use strict";
var webFaultHelper = require('../helpers/webFaultHelper.js');
var uploadResourceCallback = require('./saveResourceToDb.js');
var fs = require('fs');
var config = require('config').get('chatConf');
var im = require('imagemagick');
var joi = require("joi");

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


        var filename = json.filename
        var path = params.file.path

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
                                    format: "png",
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
                                 format: "png",
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
                                     im.identify(path, function(err, features) {
                                         if (err) {
                                             console.log("ERROR: Imagemagick is unable to identify this file type  "+err);

                                         } else {
                                             uploadResourceCallback({
                                                 name: filename,
                                                 matchName: json.filename,
                                                 type: params.type,
                                                 format: features.format,
                                                 width: features.width,
                                                 height: features.height,
                                                 depth: features.depth
                                             }, params.resCb);

                                         }
                                     });
                                 }
                             });
                         }
                     });


                 } else {   //  process other types of files
                    uploadResourceCallback({
                        name: filename,
                        matchName: json.filename,
                        type: params.type,
                        format: "MP3"
                    }, params.resCb);
                }
            }
        });

}

module.exports = saveResourceToDisk;