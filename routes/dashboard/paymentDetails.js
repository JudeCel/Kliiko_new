'use strict';

var subdomains = require('../../lib/subdomains.js');
var subscriptionServices = require('../../services/subscription');

module.exports = {
  get: get
}

function get(req, res, next) {
  let accountId = req.currentResources.account.id;
  let callbackUrl = subdomains.url(req, req.currentResources.account.subdomain, '/account-hub');

  subscriptionServices.createPortalSession(accountId, callbackUrl).then(function(redirectUrl) {
    res.redirect(redirectUrl);
  }, function(error) {
    res.send({ error: error });
  });
}
