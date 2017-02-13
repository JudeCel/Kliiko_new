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

    this.staging.protocol = 'http://';
    this.staging.siteUrl = coreAppSettings.domain;
    this.staging.port = coreAppSettings.port;
    this.staging.restUrl = coreAppSettings.restApiUrl;
    this.staging.appUrl = this.staging.protocol+this.staging.siteUrl+':'+this.staging.port;

    this.production.protocol = 'http://';
    this.production.siteUrl = coreAppSettings.domain;
    this.production.port = coreAppSettings.port;
    this.production.restUrl = coreAppSettings.restApiUrl;
    this.production.appUrl = this.production.protocol+this.production.siteUrl+':'+this.production.port;

    this[mode].mode = mode;

    window.appData.settings = angular.merge(this[mode], coreAppSettings);

    return this[mode];

}
