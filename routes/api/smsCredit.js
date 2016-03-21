'use strict';

var _ = require('lodash');
var subscriptionAddon = require('./../../services/subscriptionAddon');

module.exports = {
  get: get,
  purchase: purchase
};

function get(req, res, next) {
  subscriptionAddon.getAllAddons().then(function(result) {
    res.send({smsCreditList: result});
  }, function(err) {
    res.send(({ error: err.message }));
  });
}

function purchase(req, res, next) {

  let params = req.body;
  params.accountId = res.locals.currentDomain.id;

  subscriptionAddon.chargeAddon(params).then(function(result) {
    res.send(result);
  }, function(err) {
    res.send(({ error: err.message }));
  });
}
