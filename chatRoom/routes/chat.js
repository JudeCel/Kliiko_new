"use strict";
var express = require('express');
var router = express.Router();
var sessionMember = require('./../../middleware/sessionMember.js');

function uploadResourceCallback(userId, json) {
  console.log(json);
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
  console.log("=========================");
  next();
});

router.get('/iFrame', function(req, res, next) {
  res.render(views_path('iFrame'));
});
router.get('/help', function(req, res, next) {
  res.render(views_path('help'));
});

router.get('/:id' , sessionMember.hasAccess, function(req, res, next) {
  res.render(views_path('topic'), { title: 'chat', user: req.user, id: req.params.id });
});


router.post('/uploadimage', function (req, res) {
  socketHelper.uploadResource({
      req: req,
      res: res,
      width: 950,
      height: 460,
      type: 'image',
      resCb: uploadResourceCallback
  });
});

router.post('/uploadcollage', function (req, res) {
  socketHelper.uploadResource({
      req: req,
      res: res,
      width: 250,
      height: 250,
      type: 'collage',
      resCb: uploadResourceCallback
  });
});

router.post('/uploadaudio', function (req, res) {
  socketHelper.uploadResource({
      req: req,
      res: res,
      type: 'audio',
      resCb: uploadResourceCallback
  });
});


module.exports = router;
