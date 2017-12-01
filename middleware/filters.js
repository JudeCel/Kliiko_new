'use strict';

var models = require('../models');
var AccountUser = models.AccountUser;
var Subscription = models.Subscription;
var subdomains = require('../lib/subdomains');
var subscriptionService = require('../services/subscription');
var sessionMembersService = require('../services/sessionMember');
var myDashboardServices = require('../services/myDashboard');
var jwt = require('../lib/jwt');
var _ = require('lodash');
var q = require('q');
var request = require('request');

module.exports = {
  planSelectPage: planSelectPage,
  myDashboardPage: myDashboardPage
}

function createPlanSelectRedirectUrl(req, plan) {
  return subdomains.url(req, req.currentResources.account.subdomain, '/account-hub#/account-profile/upgrade-plan?step=2&plan=' + plan);
}

function planSelectPage(req, res, next) {
  let redirectUrl = subdomains.url(req, req.currentResources.account.subdomain, '/account-hub/landing');
  if(req.currentResources.accountUser.role ==  'accountManager') {
    Subscription.find({ where: { accountId: req.currentResources.account.id } }).then(function(subscription) {
      if(subscription) {
        next();
      }
      else {
        subscriptionService.createSubscriptionOnFirstLogin(req.currentResources.account.id, req.user.id, redirectUrl).then(function(response) {
          if(response && 'hosted_page' in response) {
            res.writeHead(301, { Location: response.hosted_page.url } );
            res.end();
          }
          else {
            if(req.session.landed) {
              let freePlans = ["free_account", "free_trial"];

              if (response.selectedPlanOnRegistration && !_.includes(freePlans, response.selectedPlanOnRegistration)) {
                let redirectUrl = createPlanSelectRedirectUrl(req, response.selectedPlanOnRegistration);
                res.redirect(redirectUrl);
              } else {
                next();
              }
            }
            else {
              res.redirect(redirectUrl);
            }
          }
        }, function(error) {
          res.send({ error: error });
        });
      }
    }, function(error) {
      res.send({ error: error });
    });
  }
  else if(shouldRedirectFacilitatorToLandingPage(req, res)) {
    req.session.landed = true;
    res.redirect(redirectUrl);
  }
  else {
    next();
  }
}

function myDashboardPage(req, res, next, accountUserId, forceBilling) {
  let myDashboardUrl = subdomains.url(req, subdomains.base, '/my-dashboard');

  myDashboardServices.getAllData(req.user.id, req.protocol).then(function(result) {
    let managers = result.accountManager || result.facilitator;
    if (!managers) {
      let theOnlySession = getTheOnlySession(result);
      if (theOnlySession && (theOnlySession.showStatus == 'Open' || theOnlySession.showStatus == 'Expired')) {
          sessionMembersService.findOrCreate(req.user.id, theOnlySession.id).then((sessionMmeber) => {
            let token = jwt.token(sessionMmeber.id, 'SessionMember:', myDashboardUrl);
            getUrl(res, token, myDashboardUrl);
          }, (error) => {
            res.redirect(myDashboardUrl);
          });
      } else {
        res.redirect(myDashboardUrl);
      }
    } else {
      let redirectURL;
      const subDomain = selectManager(result.accountManager, result.facilitator, accountUserId).subdomain;

      if (isBillingRequired(req, forceBilling)) {
        req.session.landed = true;
        redirectURL = subdomains.url(req, subDomain, '/account-hub/paymentDetails');
      } else {
        redirectURL = myDashboardUrl;
      }
      res.redirect(redirectURL);
    }
  }, function(error) {
    res.send({ error: error });
  });
}

function getUrl(res, token, url) {
  let options = {
    url: buildUrlForChatToken(),
    headers: { 'Authorization': token },
    rejectUnauthorized: false
  };

  request.get(options, function(error, response) {
    if(error || response.statusCode != 200) {
      res.redirect(url);
    }
    else {
      let body = JSON.parse(response.body);
      res.redirect(body.redirect_url);
    }
  });
}

function getTheOnlySession(accounts) {
  let participants = accounts.participant;
  let observers = accounts.observer;
  if (participants && !observers && participants.data.length == 1) {
    return participants.data[0].dataValues.session;
  } else if (observers && !participants && observers.data.length == 1) {
    return observers.data[0].dataValues.session;
  } else {
    return null;
  }
}

function selectManager(accountManagers, facilitators, accountUserId) {
  if (accountUserId) {
    if (accountManagers) {
      for (let i=0; i<accountManagers.data.length; i++) {
        if (accountManagers.data[i].id == accountUserId) {
          return accountManagers.data[i].Account;
        }
      }
    } else if (facilitators) {
      for (let i=0; i<facilitators.data.length; i++) {
        if (facilitators.data[i].id == accountUserId) {
          return facilitators.data[i].Account;
        }
      }
    }
  }

  if (accountManagers) {
    return accountManagers.data[0].Account;
  } else if (facilitators) {
    return facilitators.data[0].Account;
  }
}

function buildUrlForChatToken() {
  return process.env.SERVER_CHAT_DOMAIN_URL + ':' + process.env.SERVER_CHAT_DOMAIN_PORT + '/api/auth/token';
}

function shouldRedirectFacilitatorToLandingPage(req, res) {
  return req.user.signInCount == 1 && (req.currentResources.accountUser.role == 'facilitator') && !req.session.landed;
}

function isLandingRequired(req, forceLanding) {
  return isFirstSignIn(req) && !req.session.landed || forceLanding;
}

function isBillingRequired(req, forceBilling) {
  return isFirstSignIn(req) && !req.session.landed || forceBilling;
}

function isFirstSignIn(req) {
  return !req.user.signInCount || req.user.signInCount <= 1;
}
