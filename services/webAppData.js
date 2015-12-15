'use strict';
let config = require('config');
let fs = require('fs');
let _ = require('lodash');

let output = {};

output.version = getAppVersion();
output.mode = config.get('mode');
output.settings = config.get('webAppSettings');
output.settings = _.extend( config.get('webAppSettings'), config.get('server'));

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
