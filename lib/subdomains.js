'use strict';

var urlHeplers = require('./../services/urlHeplers');

function url(req, subDomain, path) {
  let domain = subDomain + process.env.SERVER_BASE_DOMAIN;
  return req.protocol + '://' + domain + urlHeplers.getPort() + path;
}

module.exports = {
  url: url,
  base: process.env.SERVER_BASE_SUBDOMAIN
}
