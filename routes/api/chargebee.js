"use strict";
var config = require('config');
var chargebee = require("chargebee");



module.exports = {
  chargebee_Post: chargebee_Post
};

var chargebeeConfigs = config.get('chargebee');

chargebee.configure({
  site : chargebeeConfigs.site,
  api_key : chargebeeConfigs.api_key
});

function chargebee_Post(req, res, next) {

  if (!req.body.userData) { res.send('no userData specified');  return; }
  if (!req.body.planDetails) { res.send('no planDetails specified');  return; }
  if (!req.body.planDetails) { res.send('no planDetails specified');  return; }
  if (!req.body.pages) { res.send('no pages specified');  return; }

  var userData = req.body.userData;
  chargebee.hosted_page.checkout_new({
    subscription : {
      plan_id : "plan1"
    },
    customer : {
      email : userData.email,
      first_name : userData.firstName,
      last_name : userData.lastName,
      phone : userData.mobile,
      company : userData.companyName
    },
    billing_address : {
      first_name : userData.firstName,
      last_name : userData.lastName,
      line1 : userData.postalAddress,
      city : userData.city,
      state : userData.state,
      zip : userData.postcode,
      country : userData.country
    },
    redirect_url: req.body.pages.redirect_url,
    cancel_url: req.body.pages.cancel_url,

  }).request(function(error,result){
    if (error) {
      //handle error
      res.send({error:error});
    } else {
      res.send(result);
    }
  });

  //////////
  return;

  chargebee.hosted_page.checkout_new({
    plan_id : "plan1",
    customer : {
      email : userData.email,
      first_name : userData.firstName,
      last_name : userData.lastName,
      phone : userData.mobile
    },
    billing_address : {
      first_name : userData.firstName,
      last_name : userData.lastName,
      line1 : userData.postalAddress,
      city : userData.city,
      state : userData.state,
      zip : userData.postcode,
      country : userData.country
    }
  }).request(function(error,result){
    if(error){
      //handle error
      console.log(error);
      res.send(error);
    }else{
      console.log(result);
      res.send(result);
      var subscription = result.subscription;
      var customer = result.customer;
      var card = result.card;
      var invoice = result.invoice;
    }
  });


}

