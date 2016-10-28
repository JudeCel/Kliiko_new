'use strict';

var models = require('../models');
var AccountUser = models.AccountUser;
var Subscription = models.Subscription;
var subdomains = require('../lib/subdomains');
var subscriptionService = require('../services/subscription');
var myDashboardServices = require('../services/myDashboard');
var jwt = require('../lib/jwt');
var _ = require('lodash');
var q = require('q');
var request = require('request');

module.exports = {
  planSelectPage: planSelectPage,
  myDashboardPage: myDashboardPage
}

function planSelectPage(req, res, next) {
  let redirectUrl = subdomains.url(req, res.locals.currentDomain.name, '/account-hub/landing');
  if(req.originalUrl == '/account-hub/selectPlan' || req.originalUrl == '/account-hub/landing') {
    next();
  }
  else if(_.includes(res.locals.currentDomain.roles, 'accountManager')) {
    Subscription.find({ where: { accountId: res.locals.currentDomain.id } }).then(function(subscription) {
      if(subscription) {
        next();
      }
      else {
        subscriptionService.createSubscriptionOnFirstLogin(res.locals.currentDomain.id, req.user.id, redirectUrl).then(function(response) {
          if(response && 'hosted_page' in response) {
            res.writeHead(301, { Location: response.hosted_page.url } );
            res.end();
          }
          else {
            if(req.session.landed) {
              next();
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

function myDashboardPage(req, res, next, accountUserId) {
  let myDashboardUrl = subdomains.url(req, subdomains.base, '/my-dashboard');

  myDashboardServices.getAllData(req.user.id, req.protocol).then(function(result) {

    let managers = result.accountManager || result.facilitator;
    if(!managers) {
      let observers = shouldRedirectToChat(result.observer);
      let participants = shouldRedirectToChat(result.participant);

      if((participants && !observers) || (observers && !participants)) {
        jwt.tokenForMember(req.user.id, (participants || observers).dataValues.session.id).then(function(result) {
          getUrl(res, result.token, myDashboardUrl);
        }, function(error) {
          res.redirect(myDashboardUrl);
        });
      }
      else{
        res.redirect(myDashboardUrl);
      }
    } else {
      if((!req.user.signInCount) && !req.session.landed) {
        req.session.landed = true;
        res.redirect(subdomains.url(req, selectManager(result.accountManager, result.facilitator, accountUserId).subdomain, '/account-hub/landing'));
      }
      else {
        res.redirect(myDashboardUrl);
      }
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

function shouldRedirectToChat(members) {
  if(members && members.data.length == 1) {
    return members.data[0];
  }
  else {
    return false;
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
  return req.user.signInCount == 1 && _.includes(res.locals.currentDomain.roles, 'facilitator') && !req.session.landed;
}
