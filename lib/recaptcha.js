'use strict';

var recaptcha = require('recaptcha2')

function getCaptcha() {
  return new recaptcha({
    siteKey: process.env.RECAPTCHA_SITE_KEY,
    secretKey: process.env.RECAPTCHA_SECRET_KEY
  });
}

module.exports = {
  getCaptcha: getCaptcha
}
