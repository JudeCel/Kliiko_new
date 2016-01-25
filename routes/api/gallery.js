'use strict';

var multer  = require('multer');
var galleryService = require('./../../services/account/gallery');
var socketHelper = require("../../chatRoom/socketHelper");

module.exports = {
  getResources: getResources,
  postResources: postResources,
  downloadResources: downloadResources,
  deleteResources: deleteResources,
  uploadResource: uploadResource,
  saveYoutubeResource: saveYoutubeResource
};

function postResources(req, res, next) {    
  galleryService.uploadResource(req, res).then(function(result) {
    res.send(result);
  }, function(err) {
    res.send(({ error: err.message }));
  });
}

function getResources(req, res, next) {
  galleryService.getResources(res.locals.currentDomain.id).then(function(result) {
    res.send(({ data: result }));
  });
}

function downloadResources(req, res, next) {
  galleryService.downloadResources(req.query).then(function(result) {
    res.send(result);
  }, function(err) {
    res.send(({ error: err.message }));
  });
}

function deleteResources(req, res, next) {
  galleryService.deleteResources(req.query).then(function(result) {
    res.send(result);
  }, function(err) {
    res.send(({ error: err.message }));
  });
}

function uploadResource(req, res, next) { // This should not stay here. Move to service!
  socketHelper.uploadResource({
    file: req.file,
    width: 950,
    height: 460,
    type: req.body.type,
    resCb: function(userId, json) {
      res.send(json);
    }
  });
}

function saveYoutubeResource(req, res, next) {
  galleryService.saveYoutubeData(req).then(function(result) {
    res.send(result);
  }, function(err) {
    res.send(({ error: err.message }));
  })
}
