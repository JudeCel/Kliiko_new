"use strict";
var uploadBanner = require('../../services/uploadBanner');

function views_path(action) {
  return 'dashboard/' + action;
}

exports.get = function(req, res) {
  uploadBanner.findAllBanners(function (result) {
    let params = uploadBanner.simpleParams(req.user, {}, '');
    params['banners'] = result;
    res.render(views_path('uploadBanner'), params);
  });
};

exports.post = function(req, res) {
  uploadBanner.write(req.files, function(error, message, array) {
    uploadBanner.findAllBanners(function (result) {
      let params = uploadBanner.simpleParams(req.user, error || {}, message);
      params['banners'] = result;
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
