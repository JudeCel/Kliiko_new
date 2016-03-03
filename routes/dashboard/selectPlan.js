'use strict';

var subscriptionServices = require('../../services/subscription');

module.exports = {
  get: get,
  post: post
}

function views_path(action) {
  return 'dashboard/' + action;
}

function get(req, res, next) {
  res.render(views_path('selectPlan'), { title: 'Select plan' });
}

function post(req, res, next) {
  subscriptionServices.createSubscription(res.locals.currentDomain.id, req.user.id).then(function() {
    if(req.body.planType == 'paidPlan') {
      res.redirect('/dashboard#/account-profile/upgrade-plan');
    }
    else {
      res.redirect('/dashboard');
    }
  }, function(error) {
    res.send({ error: error });
  });
}
