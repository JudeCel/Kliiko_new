'use strict';
var subdomains = require('../lib/subdomains.js');
var promotionCode = require('../services/admin/promotionCode');
// var params = promotionCode.simpleParams({ message: null, error: null }, '');

function views_path(action) {
  return 'dashboard/' + action;
};

function list(req, res) {
  promotionCode.list(function (result) {
    res.render(views_path('promotionCode'));
  });
};


module.exports = {
  list: list
}
