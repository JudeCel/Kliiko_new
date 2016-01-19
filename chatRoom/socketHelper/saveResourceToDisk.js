// var mtypes = require("../helpers/mtypes");
var webFaultHelper = require('../helpers/webFaultHelper.js');
var uploadResourceCallback = require('./saveResourceToDb.js');
var fs = require('fs');
var config = require('config').get('chatConf');
var im = require('imagemagick');
var joi = require("joi");
var dataHelper = require("../helpers/dataHelper.js");
//use PATH for imagemagick instead set
im.convert.path = config.paths.convertPath;
im.identify.path = config.paths.identifyPath;

function saveResourceToDisk(params) {
    console.log("----------------------------------------------------------------------------")
    var req = params.req;
    var res = params.res;

    var err = joi.validate(params, {
        req: joi.object().required(),
        res: joi.object().required(),
        resCb: joi.func().required(),
        width: joi.number().optional(),
        height: joi.number().optional(),
        type: joi.string().optional()
    });

    if (err.error){
      throw webFaultHelper.getValidationFault(err.error);
    }

    var contentType = req.headers['content-type'];

    var json = {
        body: '',
        header: '',
        content_type: contentType,
        boundary: contentType.split('; ')[1].split('=')[1],
        content_length: parseInt(req.headers['content-length']),
        headerFlag: true,
        filename: 'dummy.bin',
        filenameRegexp: /filename="(.*)"/m
    };

    req.on('data', function (raw) {
        json = processRawData(raw, json);
    });

    req.on('end', function () {
        // removing footer '\r\n'--boundary--\r\n' = (boundary.length + 8)
        json.body = json.body.slice(0, json.body.length - (json.boundary.length + 8));

        //	we need to make sure no spaces (" ") exist in the filename...
        //	we should also remove any apostropes
        json.filename = dataHelper.clearFileNameExtraSymbols(json.filename);
        var filename = dataHelper.getResourceFileName(json.filename);
        var path = config.paths.fsPath + "/" + 'public/uploads/' + filename;

        fs.writeFile(path, json.body, 'binary', function (err) {
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
                            if(err.arguments!=null)
                                im.identify(['-strip', path], function(err, features) {
                                    if (err)
                                        uploadResourceCallback({
                                            name: filename,
                                            matchName: json.filename,
                                            type: params.type,
                                            format: "png",
                                            width: params.width,
                                            height: params.height,
                                            depth: 1
                                        }, params.resCb);
                                    else
                                        stage2ofWriteFile(features);
                                });
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
                                     //	TODO: deal with error
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


                 } else {										//	process other types of files
                    uploadResourceCallback({
                        name: filename,
                        matchName: json.filename,
                        type: params.type,
                        format: "MP3"
                    }, params.resCb);
                }
            }
        });

        res.end();
    })
}


function processRawData(raw, json) {
    var i = 0;

    while (i < raw.length)
        if (json.headerFlag) {
            var chars = raw.slice(i, i + 4).toString();
            if (chars === '\r\n\r\n') {
                json.headerFlag = false;
                json.header = raw.slice(0, i + 4).toString();
                i += 4;
                // get the filename
                var result = json.filenameRegexp.exec(json.header);
                if (result[1]) {
                    json.filename = result[1];
                }
            } else {
                i += 1;
            }
        } else {
            // parsing body including footer
            json.body += raw.toString('binary', i, raw.length);
            i = raw.length;
        }

    return json;
}

module.exports = saveResourceToDisk;
