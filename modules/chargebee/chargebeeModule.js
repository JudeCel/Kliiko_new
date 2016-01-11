'use strict';

let config = require('config');
let chargebee = require("chargebee");
let q = require('q');


module.exports = {
  getPlans: getPlans,
  prepareHostedPage: prepareHostedPage,
  getHostedPageData: getHostedPageData,
  getCoupon: getCoupon
};

let chargebeeConfigs = config.get('chargebee');

chargebee.configure({
  site : chargebeeConfigs.site,
  api_key : chargebeeConfigs.api_key
});


function getPlans() {
  let deferred = q.defer();

  q.all([
    getPlanById('plan1'),
    getPlanById('plan2'),
    getPlanById('plan3')
  ]).then(function(respond) {
    let plans = {
      plan1: respond[0].plan,
      plan2: respond[1].plan,
      plan3: respond[2].plan
    };
    deferred.resolve(plans);
  });

  /**
   * Get plan by id from chargbee account
   * @param planId {string}
   * @returns {d.promise}
   */
  function getPlanById(planId) {
    let d = q.defer();

    chargebee.plan.retrieve(planId).request(
      function(error, result){
        error
          ? d.resolve(error)
          : d.resolve(result);

      });

    return d.promise;
  }

  return deferred.promise;

}

function prepareHostedPage(userData, planDetails, paymentDetails, pages, passThruContent) {
  let deferred = q.defer();


  chargebee.hosted_page.checkout_new({
    subscription : {
      plan_id : planDetails.plan.id,
      plan_quantity: planDetails.duration,
      coupon: paymentDetails.promocode
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
    redirect_url: pages.redirect_url,
    cancel_url: pages.cancel_url,
    pass_thru_content: passThruContent

  }).request(function(error,result){
    if (error) {
      //handle error
      deferred.reject(error);
    } else {
      deferred.resolve(result);
    }
  });

  return deferred.promise;
}

/**
 * Retrieve hosted page info
 * https://apidocs.chargebee.com/docs/api/hosted_pages#retrieve_a_hosted_page
 * @param pageId {string}
 * @returns {promise | json }
 */
function getHostedPageData(pageId) {
  let deferred = q.defer();

  chargebee.hosted_page.retrieve(pageId).request(
    function(error,result){
      error
        ? deferred.reject(error)
        : deferred.resolve(result);
    });

  return deferred.promise;

}

function getCoupon(couponId) {
  let deferred = q.defer();

  chargebee.coupon.retrieve(couponId).request(
    function(error, result){
      if (error){
        deferred.reject(error);
      } else {
        deferred.resolve(result.coupon);
      }
    });

  return deferred.promise;
}

