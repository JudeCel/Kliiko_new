var bannersService = require('./../../services/uploadBanner');

module.exports = {
  banners: banners
};

function banners(req, res, next) {
  bannersService.findAllBanners(function(result) {
    res.send(result);
  });

}