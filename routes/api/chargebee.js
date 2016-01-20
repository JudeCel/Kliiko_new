"use strict";
let q = require('q');
let chargebeeModule = require('./../../modules/chargebee/chargebeeModule');

let cache = {};

module.exports = {
  chargebeePlansGet: chargebeePlansGet,
  chargebeeSubscriptionPost: chargebeeSubscriptionPost,
  chargebeeSubscriptionPut: chargebeeSubscriptionPut,
  chargebeeSubscriptionGet: chargebeeSubscriptionGet,
  chargebeeCouponGet: chargebeeCouponGet,
  tstGet: function(req, res) {
    chargebeeModule.tstGet().then(function(response) {
      res.send(response)
    })
  }
};


function chargebeePlansGet(req, res, next) {
  chargebeeModule.getPlans().then(
    function(response) { res.send(response)},
    function(error) { res.send({error:error})}
  );

}


/**
 * https://apidocs.chargebee.com/docs/api/hosted_pages#checkout_new_subscription
 */
function chargebeeSubscriptionPost(req, res, next) {
  if (!req.body.userData) { res.send('no userData specified');  return; }
  if (!req.body.planDetails) { res.send('no planDetails specified');  return; }
  if (!req.body.paymentDetails) { res.send('no paymentDetails specified');  return; }
  if (!req.body.pages) { res.send('no pages specified');  return; }
  if (!req.body.passThruContent) { res.send('no passThruContent specified');  return; }

  let userData = req.body.userData;
  let planDetails = req.body.planDetails;
  let paymentDetails = req.body.paymentDetails;
  let pages = req.body.pages;
  let passThruContent = req.body.passThruContent;

  chargebeeModule.prepareHostedPage(userData, planDetails, paymentDetails, pages, passThruContent).then(
    function(response) { res.send(response) },
    function(error) { res.send({error:error}) }
  );

}


function chargebeeSubscriptionPut(req, res) {
  if (!req.body.userData || !req.body.userData.subscriptions) { res.send('no userData specified');  return; }
  if (!req.body.planDetails) { res.send('no planDetails specified');  return; }
  if (!req.body.paymentDetails) { res.send('no paymentDetails specified');  return; }

  let subscrId = req.body.userData.subscriptions.subscriptionId;

  let upgradeIsValid = validateUpgrade(req.body.planDetails.plan.id, req.body.userData.subscriptions.planId);

  if (!upgradeIsValid) {
    res.send({error: 'Cheater detected!'});
    return;
  }

  chargebeeModule.upgradeSubscription(subscrId, req.body.userData, req.body.planDetails).then(
    function(response) { res.send(response) },
    function(error) { res.send({error:error}) }
  );

  /**
   * Downgrading is not allowed.
   * Every desired plan should be grater, then current
   * @returns {boolean}
   */
  function validateUpgrade(desiredPlan, currentPlan) {
    var desiredPlan = desiredPlan.replace(/\D/g,'');
    var currentPlan = currentPlan.replace(/\D/g,'');

    if (desiredPlan <= currentPlan) return false;

    return true;
  }
}


/**
 * Return all subscriptions in array for current user
 * @param req
 * @param res
 */
function chargebeeSubscriptionGet(req, res) {
  chargebeeModule.getSubscriptions( req.user.id ).then(
    function(response) { res.send(response)},
    function(error) { res.send({error:error})}
  );

}


/**
 * GET all coupons
 * https://apidocs.chargebee.com/docs/api/coupons
 * https://apidocs.chargebee.com/docs/api/coupon_codes
 * @param req
 * @param res
 */
function chargebeeCouponGet(req, res) {
  if (!req.query.coupon) {
    res.send({error:'coupon query params is missed'});
    return;
  }
  chargebeeModule.getCoupon(req.query.coupon).then(
    function(response) { res.send(response)},
    function(error) { res.send({error:error})}
  );
}