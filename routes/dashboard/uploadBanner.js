"use strict";
var uploadBanner = require('../../services/uploadBanner');

function views_path(action) {
  return 'dashboard/' + action;
}

exports.getProfileBanner = function (req, res, next) {
  uploadBanner.profilePage(function (error, result) {
    if(result)
    {
      res.locals.bannerPath = '../' + result.dataValues.filepath;
    }
    else
    {
      res.locals.bannerPath = null;
    }
    next();
  });
}

exports.get = function(req, res) {
  uploadBanner.findAllBanners(function (result) {
    let params = uploadBanner.simpleParams({}, '');
    params['banners'] = result;
    res.render(views_path('uploadBanner'), params);
  });
};

exports.post = function(req, res) {
  uploadBanner.write(req.files, function(error, message) {
    uploadBanner.findAllBanners(function (result) {
      let params = uploadBanner.simpleParams(error || {}, message);
      params['banners'] = result;
      if(result.profile) {
        res.locals.bannerPath = '../' + result.profile;
      }
      res.render(views_path('uploadBanner'), params);
    });
  });
};

exports.destroy = function(req, res) {
  uploadBanner.destroy(req.params.page, function(error, message) {
    res.redirect('../uploadbanner');
  });
};

exports.uploadFields = uploadBanner.uploadFields();
