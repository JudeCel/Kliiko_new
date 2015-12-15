angular.module('globalSettings',[]).factory('globalSettings', globalSettingsFactory);
globalSettingsFactory.$inject = [];
function globalSettingsFactory() {

    var coreAppSettings = window.appData.settings;

    var mode = window.appData.mode;

    this.development = {};
    this.production = {};
    this.staging = {};
    this.test = {};

    this.development.protocol = 'http://';
    this.development.siteUrl = coreAppSettings.domain;
    this.development.port = coreAppSettings.port;
    this.development.restUrl = coreAppSettings.restApiUrl;
    this.development.appUrl = this.development.protocol+this.development.siteUrl+':'+this.development.port;
    //this.development.restApiFullUrl = this.development.protocol+this.development.siteUrl+':'+this.development.port+this.development.restUrl;

    this[mode].mode = mode;

    this[mode].logAndDebugSettings = getLogAndDebugSettings();

    window.appData.settings = angular.merge(this[mode], coreAppSettings);

    return this[mode];

    function getLogAndDebugSettings() {
        return {
            dbgModule: {
                enable: true,
                logLevel: 'trace'
            }

        };
    }


}
