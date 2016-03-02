'use strict';

var models = require('../models');
var AccountUser = models.AccountUser;
var subdomains = require('../lib/subdomains');

module.exports = {
  landingPage: landingPage,
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

function myDashboardPage(req, res, next) {
  AccountUser.findAll({
    where: {
      UserId: req.user.id
    },
    include: [models.Account]
  }).then(function(accountUsers) {
    if(accountUsers.length == 1) {
      res.redirect(subdomains.url(req, accountUsers[0].Account.name, '/dashboard'));
    }
    else {
      res.redirect(subdomains.url(req, subdomains.base, '/my-dashboard'));
    }
  }, function(error) {
    res.send({ error: error });
  });
}
