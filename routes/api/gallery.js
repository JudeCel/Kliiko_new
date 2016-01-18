'use strict';

var multer  = require('multer')
var galleryService = require('./../../services/account/gallery');

module.exports = {
  getResources: getResources,
  postResources: postResources,
  downloadResources: downloadResources,
  deleteResources: deleteResources,
  validateResourceData: validateResourceData
};

function postResources(req, res, next) {
  // let file = req.files.file;

  console.log("api file --------------------------------------");
  console.log(req.files);
  console.log("api file --------------------------------------");

  req.body.userId = req.user.id;
  galleryService.uploadResource(req.body).then(function(result) {
    res.send(result);
  });
}

function validateResourceData(req, res, next){ // This is to validate data, via CHAT bussiness logic
  req.body.userId = req.user.id;

  galleryService.validate(req.body).then(function(result) {
    res.send(({ data: result }));
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
  galleryService.downloadResources(function(result) {
    res.send(result);
  });
}

function deleteResources(req, res, next) {
  galleryService.deleteResources(function(result) {
    res.send(result);
  });
}

