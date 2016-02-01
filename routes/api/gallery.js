'use strict';

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
  let accountId = res.locals.currentDomain.id;
  let resourceType = req.query.type;

  galleryService.getResources(accountId, resourceType).then(function(result) {
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
  galleryService.uploadResourceFile(req).then(function(result) {
    res.send(result);
  }, function(err) {
    res.send(({ error: err.message }));
  })
}

function saveYoutubeResource(req, res, next) {
  galleryService.saveYoutubeData(req).then(function(result) {
    res.send(result);
  }, function(err) {
    res.send({ error: err });
  })
}
