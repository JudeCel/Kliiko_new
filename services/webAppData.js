'use strict';
let config = require('config');
let fs = require('fs');

let output = {};

output.version = getAppVersion();
output.settings = config.get('webAppSettings');


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
