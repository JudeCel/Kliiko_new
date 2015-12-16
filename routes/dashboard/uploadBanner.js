'use strict';

var uploadBannerService = require('../../services/uploadBanner');

function views_path(action) {
  return 'dashboard/' + action;
};

function getProfileBanner(req, res, next) {
  uploadBannerService.profilePage(function (error, result) {
    if(result) {
      res.locals.bannerPath = '../' + result.dataValues.filepath;
    }
    else {
      res.locals.bannerPath = null;
    }
    next();
  });
};

function get(req, res) {
  uploadBannerService.findAllBanners(function (result) {
    let params = uploadBannerService.simpleParams({}, '');
    params['banners'] = result;
    res.render(views_path('uploadBanner'), params);
  });
};

function post(req, res) {
  uploadBannerService.write(req.files, function(error, message) {
    uploadBannerService.findAllBanners(function (result) {
      let params = uploadBannerService.simpleParams(error || {}, message);
      params['banners'] = result;
      if(result.profile) {
        res.locals.bannerPath = '../' + result.profile;
      }
      res.render(views_path('uploadBanner'), params);
    });
  });
};

function destroy(req, res) {
  uploadBannerService.destroy(req.params.page, function(error, message) {
    res.redirect('../uploadbanner');
  });
};

module.exports = {
  getProfileBanner: getProfileBanner,
  get: get,
  post: post,
  destroy: destroy,
  uploadFields: uploadBannerService.uploadFields()
}
