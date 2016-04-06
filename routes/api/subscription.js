'use strict';

var _ = require('lodash');
var subscription = require('./../../services/subscription');

module.exports = {
  getPlans: getPlans,
  updatePlan: updatePlan,
  retrievCheckoutAndUpdateSub: retrievCheckoutAndUpdateSub
};

function getPlans(req, res, next) {
  let accountId = res.locals.currentDomain.id;

  subscription.getAllPlans(accountId).then(function(result) {
    res.send(result);
  }, function(err) {
    res.send({ error: err.message });
  });
}

function updatePlan(req, res, next) {
  let accountId = res.locals.currentDomain.id;
  let newPlanId = req.body.planId;

  subscription.updateSubscription(accountId, newPlanId).then(function(result) {
    res.send(result);
  }, function(err) {
    res.send({ error: err });
  });
}

function retrievCheckoutAndUpdateSub(req, res, next) {
  let hostedPageId = req.body.hostedPageId;

  subscription.retrievCheckoutAndUpdateSub(hostedPageId).then(function(result) {
    res.send(result);
  }, function(error) {
    res.send({ error: error });
  })
}