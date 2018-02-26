'use strict';
let fs = require('fs');
let _ = require('lodash');

let output = {};

output.version = getAppVersion();
output.mode = process.env.MODE;
output.settings = {
  restApiUrl: process.env.WEB_APP_SETTINGS_REST_API_URL,
  port: process.env.SERVER_PORT,
  baseDomain: process.env.SERVER_BASE_DOMAIN,
  domain: process.env.SERVER_DOMAIN,
  serverChatDomainUrl: process.env.SERVER_CHAT_DOMAIN_URL + ':' + process.env.SERVER_CHAT_DOMAIN_PORT,
  socketServerUrl: process.env.EVENT_SOCKET_SERVER_URL,
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
