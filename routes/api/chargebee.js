"use strict";
let q = require('q');
let chargebeeModule = require('./../../modules/chargebee/chargebeeModule');


module.exports = {
  chargebeePlansGet: chargebeePlansGet,
  chargebeeSubscriptionPost: chargebeeSubscriptionPost
};


function chargebeePlansGet(req, res, next) {
  chargebeeModule.getPlans().then(function(response) {
    res.send(response);
  });
}




//https://apidocs.chargebee.com/docs/api/hosted_pages#checkout_new_subscription
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

