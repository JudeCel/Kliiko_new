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
  galleryService.uploadResource(req, res).then(function(result) {
    res.send(result);
  }, function(err) {
    res.send(({ error: err.message }));
  });
}

function getResources(req, res, next) {
  galleryService.getResources(res.locals.currentDomain.name).then(function(result) {
    res.send(({ data: result }));
  });
}

function downloadResources(req, res, next) {
  galleryService.downloadResources(req.query, function(result) {
    res.send(result);
  });
}

function deleteResources(req, res, next) {
  galleryService.deleteResources(req.query).then(function(result) {
    res.send(result);
  }, function(err) {
    res.send(({ error: err.message }));
  });
}

