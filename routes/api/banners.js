'use strict';

var bannersService = require('./../../services/uploadBanner');

module.exports = {
  banners_Get: banners_Get,
  banners_Post: banners_Post,
  banners_Delete: banners_Delete,
  banners_bannerType_Post: banners_bannerType_Post
};

function banners_Get(req, res, next) {
  bannersService.findAllBanners(function(result) {
    res.send(result);
  });
}

function banners_Post(req, res, next) {
  let file = req.files.file;
  let bannerType = req.body.bannerType;

  if (!file) { res.send({error: 'No File Recieved'}); return; }
  if (!bannerType) { res.send({error: 'No bannerType is specified'}); return; }

  bannersService.write(file, bannerType).then(
    function(resp) { res.send(resp) },
    function(err) { res.send({error: err}) }
  );

}

function banners_Delete(req, res, next) {
  var bannerType = req.params.bannerType;

  bannersService.destroy(bannerType).then(
    function(resp) { res.send({ok:resp}) },
    function(err) { res.send( { error:error }) }
  );
}

function banners_bannerType_Post(req, res, next) {
  let bannerType = req.params.bannerType;
  let link = req.body.link;

  bannersService.saveLink(bannerType, link).then(
    function(resp) { res.send({ok:resp}) },
    function(err) { res.send( { error:error }) }
  );
}