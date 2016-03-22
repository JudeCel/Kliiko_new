'use strict';

var config = require('config');

function url(req, subDomain, path) {
  let domain = subDomain + process.env.SERVER_BASE_DOMAIN
  return req.protocol + '://' + domain + getPort() + path
}

function getPort() {
  let port = ''
  if (process.env.SERVER_PORT) {
    port = ':'+ process.env.SERVER_PORT
  }
  return port
}

module.exports = {
  url: url,
  base: process.env.SERVER_BASE_SUBDOMAIN
}
