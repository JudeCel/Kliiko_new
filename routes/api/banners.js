'use strict';

var bannersService = require('./../../services/uploadBanner');

module.exports = {
  bannersGet: bannersGet,
  bannersPost: bannersPost,
  bannersDelete: bannersDelete,
  bannersBannerTypePost: bannersBannerTypePost
};

function bannersGet(req, res, next) {
  bannersService.findAllBanners(function(result) {
    res.send(result);
  });
}

function bannersPost(req, res, next) {
  let file = req.files.file;
  let bannerType = req.body.bannerType;

  if (!file) { res.send({error: 'No File Recieved'}); return; }
  if (!bannerType) { res.send({error: 'No bannerType is specified'}); return; }

  bannersService.write(file, bannerType).then(
    function(resp) { res.send(resp) },
    function(err) { res.send({error: err}) }
  );

}

function bannersDelete(req, res, next) {
  var bannerType = req.params.bannerType;

  bannersService.destroy(bannerType).then(
    function(resp) { res.send({ok:resp}) },
    function(err) { res.send( { error:error }) }
  );
}

function bannersBannerTypePost(req, res, next) {
  let bannerType = req.params.bannerType;
  let link = req.body.link;

  bannersService.saveLink(bannerType, link).then(
    function(resp) { res.send({ok:resp}) },
    function(err) { res.send( { error:error }) }
  );
}