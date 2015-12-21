var constants = require('../../util/constants');
var promotionCodeService = require('../../services/admin/promotionCode');

function get(req, res, next) {
  promotionCodeService.findAllPromoCodes(function(error, promos) {
    if(error) {
      res.send({ error: error });
    }
    else {
      res.send({ promos: promos, discountTypes: constants.promotionCodeTypes, dateFormat: constants.dateFormat });
    }
  });
};

function create(req, res, next) {
  promotionCodeService.createPromoCode(req.body, function(error, promo) {
    if(error) {
      res.send({ error: error });
    }
    else {
      res.send({ promo: promo, message: 'Successfully created new Promotion Code' });
    }
  });
};

function remove(req, res, next) {
  promotionCodeService.removePromoCode(req.params.id, function(error) {
    if(error) {
      res.send({ error: error });
    }
    else {
      res.send({ message: 'Successfully removed Promotion Code' });
    }
  });
};

function update(req, res, next) {
  promotionCodeService.updatePromoCode(req.body, function(error, promo) {
    if(error) {
      res.send({ error: error });
    }
    else {
      res.send({ promo: promo, message: 'Successfully updated Promotion Code' });
    }
  });
};

module.exports = {
  get: get,
  create: create,
  remove: remove,
  update: update
};
