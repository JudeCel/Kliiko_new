'use strict';

var _ = require('lodash');
var subscriptionAddon = require('./../../services/subscriptionAddon');

module.exports = {
  get: get,
  creditCount: creditCount,
  purchase: purchase
};

function get(req, res, next) {
  subscriptionAddon.getAllAddons().then(function(result) {
    res.send({smsCreditList: result});
  }, function(err) {
    res.send(({ error: err.message }));
  });
}

function creditCount(req, res, next) {
  let accountId = req.currentResources.account.id;

  subscriptionAddon.creditCount(accountId).then(function(result) {
    res.send({creditCount: result});
  }, function(err) {
    res.send(({ error: err.message }));
  });
}

function purchase(req, res, next) {
  let params = req.body;
  params.accountId = req.currentResources.account.id;

  subscriptionAddon.chargeAddon(params).then(function(result) {
    res.send(result);
  }, function(error) {
    res.send(({ error: error }));
  });
}
