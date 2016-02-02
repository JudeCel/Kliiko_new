'use strict';

let config = require('config');
let chargebee = require("chargebee");
let q = require('q');
let models =  require('./../../models');
let User = models.User;
let Subscription = models.Subscription;
//let moment = require('moment');

module.exports = {
  getPlans: getPlans,
  prepareHostedPage: prepareHostedPage,
  createSubscription: createSubscription,
  getSubscriptions:getSubscriptions,
  upgradeSubscription:upgradeSubscription,
  //getHostedPageData: getHostedPageData,
  getCoupon: getCoupon,
  tstGet: tstGet
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

/**
 * Prepare url for hosted page, so front end can use it to redirect
 * @param userData {object}
 * @param planDetails {object}
 * @param paymentDetails {object}
 * @param pages {object}
 * @param passThruContent {object}
 * @returns {*|promise}
 */
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
      zip : userData.postCode,
      country : userData.country
    },
    redirect_url: pages.redirect_url,
    cancel_url: pages.cancel_url,
    pass_thru_content: JSON.stringify(passThruContent)

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
 * Fetch data about given hosted page and then save it for given user.
 * User Id will be returned within hosted page data.
 * In successful case should return redirect url (also comes within hosted page data)
 * @param hostedPageId {string}
 * @returns {promise|string}
 */
function createSubscription(hostedPageId) {
  let deferred = q.defer();

  if (!hostedPageId) { deferred.reject('hostedPageId is not provided!'); return deferred.promise;}

  // Fetch data about given hosted
  getHostedPageData(hostedPageId).then(
    function(res) {
      // res example: https://apidocs.chargebee.com/docs/api/hosted_pages#retrieve_a_hosted_page
      let hostedPageData = res.hosted_page;
      let subsData = hostedPageData.content.subscription;
      let customerData = hostedPageData.content.customer;
      let cardData = hostedPageData.content.card;

      let redirectPage = JSON.parse(hostedPageData.pass_thru_content).successAppUrl;
      let userId = JSON.parse(hostedPageData.pass_thru_content).userId;

      // save to given user
      User.find({
        where: {id: userId}
      }).
      then(
        function(resultUser) {

          let subsParams = {
            planId: subsData.plan_id,
            subscriptionId: subsData.id,
            planQuantity: subsData.plan_quantity,
            status: subsData.status,
            subscribtionCreatedAt: new Date( subsData.created_at * 1000 ).getTime(),
            startedAt: new Date( subsData.started_at * 1000 ).getTime(),
            createdFromIp: subsData.created_from_ip,
            hasScheduledChanges: subsData.has_scheduled_changes,
            dueInvoicesCount: subsData.due_invoices_count,
            customerData: customerData,
            cardData: cardData
          };

          if (subsData.trial_start && subsData.trial_end ) {
            subsParams.trialStart = new Date( subsData.trial_start * 1000 ).getTime();
            subsParams.trialEnd = new Date( subsData.trial_end * 1000 ).getTime();
          }



          resultUser.createSubscription(subsParams).
          then(function(dbRes) { deferred.resolve(redirectPage)  }).
          catch(function(dbErr) { deferred.reject(dbErr); return deferred.promise });
        },
        function(userErr) {
          deferred.reject(userErr);
          return deferred.promise;
        }
      );



    },
    function(err) { deferred.reject(userErr); return deferred.promise;}
  );

  return deferred.promise;
}


/**
 * Return users subscriptions
 * @param userId
 * @returns {*}
 */
function getSubscriptions(userId, all) {
  let deferred = q.defer();

  User.find({
    where: {id: userId}
  }).
    then(function(resultUser) {
      resultUser.getSubscriptions().
        then(function(subsRes) {
          deferred.resolve(subsRes);
        }).
        catch(function(userErr) {
         deferred.reject(userErr);
        });
    }).
    catch(function(findErr) {
      deferred.reject(findErr);
    });

  return deferred.promise;
}

/**
 * Upgrade and prorate subscription
 * @param subscriptionId
 * @param userData
 * @param planData
 * @returns {*}
 */
function upgradeSubscription(subscriptionId, userData, planData) {
  let deferred = q.defer();

  chargebee.subscription.update(subscriptionId, {
    plan_id : planData.plan.id,
    billing_address : {
      first_name : userData.firstName,
      last_name : userData.lastName,
      line1 : userData.postalAddress,
      city : userData.city,
      state : userData.state,
      zip : userData.postCode,
      country : userData.country
    }
  }).request(function(error, result){
    if (error) {deferred.reject(error); return deferred.promise;}

    let subsData = result.subscription;

    let subsParams = {
      planId: subsData.plan_id,
      subscriptionId: subsData.id,
      planQuantity: subsData.plan_quantity,
      status: subsData.status,
      trialStart: new Date( subsData.trial_start * 1000 ).getTime(),
      trialEnd: new Date( subsData.trial_end * 1000 ).getTime(),
      subscribtionCreatedAt: new Date( subsData.created_at * 1000 ).getTime(),
      startedAt: new Date( subsData.started_at * 1000 ).getTime(),
      createdFromIp: subsData.created_from_ip,
      hasScheduledChanges: subsData.has_scheduled_changes,
      dueInvoicesCount: subsData.due_invoices_count,
      customerData: result.customer
    };

    if ( subsData.trial_start && subsData.trial_end ) {
      subsParams.trialStart = new Date( subsData.trial_start * 1000 ).getTime();
      subsParams.trialEnd = new Date( subsData.trial_end * 1000 ).getTime();
    }

    Subscription.update(subsParams, {where: {subscriptionId:subscriptionId}}
    ).then(function(res) {

      deferred.resolve(result);

    });

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

function tstGet() {
  let deferred = q.defer();
  let subscriptionId = '1pCzCGoPZZrrfi3HB';

  Subscription.update({
    planId: 'NewName'
  }, {where: {subscriptionId:subscriptionId}}
  ).then(function(res) {
    deferred.resolve(res)
  });

  return deferred.promise;
}