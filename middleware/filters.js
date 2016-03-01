"use strict";
var subdomains = require('../lib/subdomains');

function landingPage(req, res, next) {
  if(!req.session.landingPage && req.user.signInCount == 1) {
    req.session.landingPage = true;
    res.redirect(subdomains.url(req, req.user.ownerAccountSubdomain, '/dashboard/landing'));
  } else {
    next();
  }
}
module.exports = {
  landingPage: landingPage,
}
