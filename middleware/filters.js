"use strict";
var subdomains = require('../lib/subdomains');

function landingPage(req, res, next) {
  if (req.user.signInCount == 1) {
    res.redirect(subdomains.url(req, req.user.ownerAccountSubdomain, '/dashboard/landing'));
  } else {
    res.redirect(subdomains.url(req, req.user.ownerAccountSubdomain, '/dashboard'));
  }
}
module.exports = {
  landingPage: landingPage,
}
