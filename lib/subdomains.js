"use strict";
var config = require('config');

function url(req, subDomain, path) {
  return req.protocol + '://' + subDomain +  config.get('server')['domain'] + ':'+ config.get('server')['port'] + path
}

module.exports = {
  url: url
}
