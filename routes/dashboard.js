"use strict";
var express = require('express');
var router = express.Router();
var subdomains = require('../lib/subdomains.js');
var changePassword = require('../repositories/changePassword');
var uploadBanner = require('../repositories/uploadBanner');
var multer  = require('multer')

function views_path(action) {
let views_name_space = "dashboard/";
  return views_name_space + action
}

router.use(function (req, res, next) {
  if (req.user) {
    next();
  } else {
    res.redirect(subdomains.url(req, 'insider', '/'));
  }
});

router.get('/', function(req, res, next) {
  res.render(views_path('index'), { title: '', user: req.user });
});

router.get('/changepassword', function(req, res) {
  res.render(views_path('changePassword'), { title: '', user: req.user, error: "", message: "" });
});

router.post('/changepassword', function(req, res) {
  changePassword.save(req, function(errors, message, user){
    if (errors) {
      res.render(views_path('changePassword'), { title: 'Change password', user: req.user, error: errors.message, message: message });
    }else{
      res.render(views_path('changePassword'), { title: 'Change password', user: req.user, error: "", message: message });
    }
  });
});

router.get('/uploadbanner', function(req, res) {
  res.render(views_path('uploadBanner'), { title: '', user: req.user, error: '', message: '' });
});

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/banners')
  },
  filename: function (req, file, cb) {
    var re = /(?:\.([^.]+))?$/;
    var extension = '.' + re.exec(file.originalname)[1];
    cb(null, file.fieldname + extension)
  }
})

var upload = multer({ storage: storage })

var cpUpload = upload.fields([{ name: 'profile', maxCount: 1 }, { name: 'sessions', maxCount: 1 }, { name: 'resources', maxCount: 1 }])
router.post('/uploadbanner', cpUpload, function(req, res) {
  uploadBanner.write(req, function(errors, message, user){
    if (errors) {
      res.render(views_path('uploadBanner'), { title: 'Upload banner', user: req.user, error: errors.message, message: message });
    } else {
      res.render(views_path('uploadBanner'), { title: 'Upload banner', user: req.user, error: "", message: message });
    }
  });
});

module.exports = router;
