"use strict";
var express = require('express');
var router = express.Router();
var _ = require('lodash');
var sessionMember = require('./../../middleware/sessionMember.js');
var socketHelper = require("../socketHelper");
var config = require('config');
var fileUploader = require('./../../middleware/fileUploader.js');



function ioUrl() {
  let serverConf = config.get('server')
  return serverConf.domain + ":" + serverConf.port + serverConf.chatUrl
}

function uploadResourceCallback(userId, json) {
  var io = require("../sockets.js").io();
  var foundUser = _.find(io.sockets, function (client) {
    return client.userId == userId;
  });
  
  if (foundUser) {
    foundUser.emit("fileuploadcomplete", json);
  }
}

function views_path(action) {
let views_name_space = "chat/"
  return views_name_space + action
}

router.use(function (req, res, next) {
  next();
});

router.get('/iFrame', function(req, res, next) {
  res.render(views_path('iFrame'));
});
router.get('/help', function(req, res, next) {
  res.render(views_path('help'));
});

router.get('/:id' , sessionMember.hasAccess, function(req, res, next) {
  res.render(views_path('topic'), { title: 'chat', user: req.user, id: req.params.id, ioUrl: ioUrl() });
});

router.post('/uploadimage', fileUploader(), function (req, res) {
  socketHelper.uploadResource({
      file: req.file,
      width: 950,
      height: 460,
      type: 'image',
      resCb: uploadResourceCallback
  });
});

router.post('/uploadcollage', fileUploader(), function (req, res) {
  socketHelper.uploadResource({
      file: req.file,
      width: 250,
      height: 250,
      type: 'collage',
      resCb: uploadResourceCallback
  });
});

router.post('/uploadaudio', fileUploader(), function (req, res) {
  socketHelper.uploadResource({
      file: req.file,
      type: 'audio',
      resCb: uploadResourceCallback
  });
});


module.exports = router;
