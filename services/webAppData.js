'use strict';
let fs = require('fs');
let _ = require('lodash');

let output = {};

output.version = getAppVersion();
output.mode = process.env.MODE;
output.settings = {
  restApiUrl: process.env.WEB_APP_SETTINGS_REST_API_URL,
  paymentModules: {
    chargebee: {
      apiEndPoint: process.env.WEB_APP_SETTINGS_PAYMENT_MODULES_CHARGEBEE_API_END_POINT
    }
  },
  port: process.env.SERVER_PORT,
  baseDomain: process.env.SERVER_BASE_DOMAIN,
  domain: process.env.SERVER_DOMAIN,
  chatUrl: process.env.SERVER_CHAT_URL,
  baseSubdomain: process.env.SERVER_BASE_SUBDOMAIN
}

module.exports = output;

/**
 * Populate appData.version for web app
 * @returns {string}
 */
function getAppVersion() {
    let packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    let version = packageJson.version;
    let description = packageJson.description;

    return version + ' - ' + description;
}
