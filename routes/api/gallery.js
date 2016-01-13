'use strict';

var galleryService = require('./../../services/account/gallery');

module.exports = {
  getResources: getResources,
  downloadResources: downloadResources,
  deleteResources: deleteResources
};

function getResources(req, res, next) {
  galleryService.getResources(function(result) {
    res.send(result);
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
