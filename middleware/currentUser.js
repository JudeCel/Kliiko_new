'use strict';

var subdomains = require('./../lib/subdomains.js');

function assign(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.currentUser.myDashboardUrl = subdomains.url(req, 'insider', '/my-dashboard');
  next();
}

module.exports = {
  assign: assign
}
