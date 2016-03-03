'use strict';

var galleryService = require('./../../services/account/gallery');
var socketHelper = require("../../chatRoom/socketHelper");

module.exports = {
  getResources: getResources,
  postResources: postResources,
  downloadResources: downloadResources,
  deleteResources: deleteResources,
  uploadResource: uploadResource,
  saveYoutubeResource: saveYoutubeResource,
  deleteZipFile: deleteZipFile
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
  let accountRoles = res.locals.currentDomain.roles;
  let resourceType = req.query.type;

  galleryService.getResources(accountId, accountRoles, resourceType).then(function(result) {
    res.send(({ data: result }));
  });
}

function downloadResources(req, res, next) {
  galleryService.downloadResources(req.query).then(function(result) {
    res.send(result);
  }, function(err) {
    res.send(({ error: err }));
  });
}

function deleteResources(req, res, next) {
  galleryService.deleteResources(req.query).then(function(result) {
    res.send(result);
  }, function(err) {
    res.send(({ error: err.message }));
  });
}

function uploadResource(req, res, next) {
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

function deleteZipFile(req, res, next) {
  galleryService.deleteZipFile(req.body).then(function(result) {
    res.send(result);
  }, function(error) {
    res.send(error);
  })
}
