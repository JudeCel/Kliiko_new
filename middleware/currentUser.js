'use strict';

var subdomains = require('./../lib/subdomains.js');

function assign(req, res, next) {
  if(req.user) {
    res.locals.currentUser = req.user;
    res.locals.currentUser.myDashboardUrl = subdomains.url(req, subdomains.base, '/my-dashboard');
    if(res.locals.currentDomain) {
      res.locals.currentUser.role = res.locals.currentDomain.roles[0];
    }
  }
  next();
}

module.exports = {
  assign: assign
}
