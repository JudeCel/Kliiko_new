'use strict';

var _ = require('lodash');
var subscription = require('./../../services/subscription');
var subscriptionValidator = require('./../../services/validators/subscription');
var subdomains = require('../../lib/subdomains');
var filters = require('./../../models/filters');

module.exports = {
  getPlans: getPlans,
  updatePlan: updatePlan,
  retrievCheckoutAndUpdateSub: retrievCheckoutAndUpdateSub,
  postQuote: postQuote,
  planAllowsToDoIt: planAllowsToDoIt
};

function postQuote(req, res, next) {
  subscription.postQuote(req.body).then(function(result) {
    res.send(result);
  }, function(error) {
    res.send({ error: error });
  })
}

function planAllowsToDoIt(req, res, next) {
  let accountId = res.locals.currentDomain.id;
  subscriptionValidator.planAllowsToDoIt(accountId, req.query.features).then(function(result) {
    res.send();
  }, function(err) {
    res.send({ error: filters.errors(err) });
  });
}

function getPlans(req, res, next) {
  let accountId = res.locals.currentDomain.id;

  subscription.getAllPlans(accountId).then(function(result) {
    res.send(result);
  }, function(err) {
    res.send({ error: err.message });
  });
}

function updatePlan(req, res, next) {
  let redirectUrl = subdomains.url(req, res.locals.currentDomain.name, '/account-hub#/account-profile/upgrade-plan')
  let params = {
    accountId: res.locals.currentDomain.id,
    newPlanId: req.body.planId,
    redirectUrl: redirectUrl
  }

  subscription.updateSubscription(params).then(function(result) {
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
