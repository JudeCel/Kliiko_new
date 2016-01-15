'use strict';

var multer  = require('multer')
var galleryService = require('./../../services/account/gallery');

module.exports = {
  getResources: getResources,
  postResources: postResources,
  downloadResources: downloadResources,
  deleteResources: deleteResources
};

function postResources(req, res, next) {
  req.body.userId = req.user.id;
  galleryService.uploadResource(req.body).then(function(result) {
    res.send(result);
  });
}

function getResources(req, res, next) {
  galleryService.getResources(res.locals.currentDomain.name).then(function(result) {
    res.send(({ data: result }));
  });
}

function downloadResources(req, res, next) {
  galleryService.downloadResources(function(result) {
    res.send(result);
  });
}

function deleteResources(req, res, next) {
  galleryService.deleteResources(function(result) {
    res.send(result);
  });
}
