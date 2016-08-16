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
  let redirectUrl = subdomains.url(req, res.locals.currentDomain.name, '/dashboard/landing');

  if(req.originalUrl == '/dashboard/selectPlan' || req.originalUrl == '/dashboard/landing') {
    next();
  }
  else if(_.includes(res.locals.currentDomain.roles, 'accountManager')) {
    Subscription.find({ where: { accountId: res.locals.currentDomain.id } }).then(function(subscription) {
      if(subscription) {
        next();
      }
      else {
        subscriptionService.createSubscriptionOnFirstLogin(res.locals.currentDomain.id, req.user.id, redirectUrl).then(function(response) {
          if('hosted_page' in response) {
            res.writeHead(301, { Location: response.hosted_page.url } );
            res.end();
          }
          else {
            res.redirect(redirectUrl);
          }
        }, function(error) {
          res.send({ error: error });
        });
      }
    }, function(error) {
      res.send({ error: error });
    });
  }
  else if(req.user.signInCount == 1 && _.includes(res.locals.currentDomain.roles, 'facilitator') && !req.session.landed) {
    req.session.landed = true;
    res.redirect(redirectUrl);
  }
  else {
    next();
  }
}

function myDashboardPage(req, res, next) {
  let myDashboardUrl = subdomains.url(req, subdomains.base, '/my-dashboard');

  myDashboardServices.getAllData(req.user.id, req.protocol).then(function(result) {
    let managers = result.accountManager || result.facilitator;

    if(!managers) {
      let observers = shouldRedirectToChat(result.observer);
      let participants = shouldRedirectToChat(result.participant);

      if(participants && observers) {
        res.redirect(myDashboardUrl);
      }
      else if(participants || observers) {
        jwt.tokenForMember(req.user.id, (participants || observers).dataValues.session.id).then(function(result) {
          getUrl(res, result.token, myDashboardUrl);
        }, function(error) {
          res.redirect(myDashboardUrl);
        });
      }
    }
    else {
      if(!req.user.signInCount || req.user.signInCount == 1) {
        res.redirect(subdomains.url(req, selectManager(result.accountManager, result.facilitator).subdomain, '/dashboard'));
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
    url: process.env.SERVER_CHAT_DOMAIN_URL + ':' + process.env.SERVER_CHAT_DOMAIN_PORT + '/api/auth/token',
    headers: { 'Authorization': token }
  };

  request.get(options, function(error, response) {
    let body = JSON.parse(response.body);
    if(error || response.statusCode != 200) {
      res.redirect(url);
    }
    else {
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

function selectManager(accountManagers, facilitators) {
  if(accountManagers) {
    return accountManagers.data[0].Account;
  }
  else if(facilitators) {
    return facilitators.data[0].Account;
  }
}
