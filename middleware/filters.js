'use strict';

var models = require('../models');
var AccountUser = models.AccountUser;
var Subscription = models.Subscription;
var subdomains = require('../lib/subdomains');
var subscriptionService = require('../services/subscription');
var _ = require('lodash');
var q = require('q');

module.exports = {
  landingPage: landingPage,
  planSelectPage: planSelectPage,
  myDashboardPage: myDashboardPage
}

function landingPage(req, res, next) {
  if(!req.session.landingPage && req.user.signInCount == 1) {
    req.session.landingPage = true;
    res.redirect(subdomains.url(req, req.user.ownerAccountSubdomain, '/dashboard/landing'));
  } else {
    next();
  }
}

function planSelectPage(req, res, next) {
  let redirectUrl = subdomains.url(req, res.locals.currentDomain.name, '/dashboard/landing');
  if(req.originalUrl == '/dashboard/selectPlan') {
    next();
  }
  else if(_.includes(res.locals.currentDomain.roles, 'accountManager')) {
    Subscription.find({
      where: {
        accountId: res.locals.currentDomain.id
      }
    }).then(function(subscription) {
      if(subscription) {
        next();
      } else {
        subscriptionService.createSubscriptionOnFirstLogin(res.locals.currentDomain.id, req.user.id, redirectUrl).then(function(response) {
          if('hosted_page' in response) {
            res.writeHead(301, { Location: response.hosted_page.url } );
            res.end();
          }else {
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
  else {
    next();
  }
}

function myDashboardPage(req, res, next) {
  AccountUser.findAll({
    where: {
      UserId: req.user.id
    },
    include: [models.Account]
  }).then(function(accountUsers) {
    if(accountUsers.length == 1 && compareRoles(accountUsers[0].role)) {
      res.redirect(subdomains.url(req, accountUsers[0].Account.name, '/dashboard#/account-profile'));
    }
    else {
      res.redirect(subdomains.url(req, subdomains.base, '/my-dashboard'));
    }
  }, function(error) {
    res.send({ error: error });
  });
}

function compareRoles(role) {
  return role == 'accountManager' || role == 'admin';
}
