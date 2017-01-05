'use strict';

var subdomains = require('./../lib/subdomains.js');

function assign(req, res, next) {
  if(req.user) {
    res.locals.currentUser.myDashboardUrl =  '/my-dashboard';
  }
  next();
}

module.exports = {
  assign: assign
}
