(function () {
  'use strict';

  angular.module('KliikoApp.mailTemplate', []).factory('mailTemplate', mailTemplateFactory);

  mailTemplateFactory.$inject = ['$q', 'globalSettings', 'brandColourServices', '$resource', 'dbg', '$rootScope'];
  function mailTemplateFactory($q, globalSettings, brandColourServices, $resource, dbg, $rootScope) {

    var mailRestApi = {
      mailTemplates: $resource(globalSettings.restUrl + '/mailTemplates', {}, {get: {method: 'GET'}}),
      sessionMailTemplates: $resource(globalSettings.restUrl + '/sessionMailTemplates', {}, {get: {method: 'GET'}}),
      mailTemplate: $resource(globalSettings.restUrl + '/mailTemplate', {}, {post: {method: 'POST'}}),
      saveMailTemplate: $resource(globalSettings.restUrl + '/mailTemplate/save', {}, {post: {method: 'POST'}}),
      deleteMailTemplate: $resource(globalSettings.restUrl + '/mailTemplate', {}, {post: {method: 'POST'}}),
      resetMailTemplate: $resource(globalSettings.restUrl + '/mailTemplate/reset', {}, {post: {method: 'POST'}}),
      previewMailTemplate: $resource(globalSettings.restUrl + '/mailTemplate/preview', {}, {post: {method: 'POST'}}),
    };

    var MailTemplateService = {};
    MailTemplateService.getAllSessionMailTemplates = getAllSessionMailTemplates;
    MailTemplateService.getAllMailTemplates = getAllMailTemplates;
    MailTemplateService.saveMailTemplate = saveMailTemplate;
    MailTemplateService.saveTemplate = saveTemplate;
    MailTemplateService.getMailTemplate = getMailTemplate;
    MailTemplateService.deleteMailTemplate = deleteMailTemplate;
    MailTemplateService.resetMailTemplate = resetMailTemplate;
    MailTemplateService.previewMailTemplate = previewMailTemplate;
    return MailTemplateService;

    function getAllSessionMailTemplates(getSystemMail, params, brandProjectPreferenceId) {
      dbg.log2('#KliikoApp.mailTemplate > get all session mail templates for user');
      var deferred = $q.defer();
        //todo: refactor
      mailRestApi.sessionMailTemplates.get({getSystemMail: getSystemMail, params: params}, function (res) {
        dbg.log2('#KliikoApp.sessionMailTemplate > get all templates> server respond >');
        getColors(brandProjectPreferenceId).then(function (colorsRes) {
          deferred.resolve({mailTemplates: res, colors: colorsRes});
        });
      });
      return deferred.promise;
    }

    function getColors(brandProjectPreferenceId) {
      var deferred = $q.defer();
      brandColourServices.getAllSchemes().then(function (res) {
        var resObj = {};
        if (res.manageFields) {
          resObj.manageFields = res.manageFields;
        }
        if (res.data) {
          res.data.forEach(function (el) {
            if (brandProjectPreferenceId == el.id) {
              resObj.colours = el.colours;
            }
          });
        }
        deferred.resolve(resObj);
      });
      return deferred.promise;
    }

    function getAllMailTemplates(getSystemMail) {
      dbg.log2('#KliikoApp.mailTemplate > get all mail templates for user');
      var deferred = $q.defer();

      mailRestApi.mailTemplates.get({getSystemMail:getSystemMail}, function (res) {
        dbg.log2('#KliikoApp.mailTemplate > get all templates> server respond >');
        deferred.resolve(res);
      });
      return deferred.promise;
    }

    function getMailTemplate(req) {
      dbg.log2('#KliikoApp.mailTemplate > get mail template', req);
      var deferred = $q.defer();
      mailRestApi.mailTemplate.post({mailTemplate:req}, function (res) {
        dbg.log2('#KliikoApp.mailTemplate > get get mail template> server respond >');
        deferred.resolve(res);
      });
      return deferred.promise;
    }

    function saveMailTemplate(mTemplate, createCopy) {
      dbg.log2('#KliikoApp.mailTemplate > save mail template', mTemplate);
      var deferred = $q.defer();

      mailRestApi.saveMailTemplate.post({mailTemplate:mTemplate, copy: createCopy}, function (res) {
        dbg.log2('#KliikoApp.mailTemplate > save mail template> server respond >');
        deferred.resolve(res);
      });
      return deferred.promise;
    }

    function saveTemplate(template) {
      var deferred = $q.defer();
      mailRestApi.saveMailTemplate.post({},{mailTemplate:template}, function(res) {
        $rootScope.$broadcast('updateSessionBuilderEmails', res);
        deferred.resolve(res);
      });
      return deferred.promise;
    }

    function deleteMailTemplate(mTemplate) {
      dbg.log2('#KliikoApp.mailTemplate > delete mail template');
      var deferred = $q.defer();

      mailRestApi.deleteMailTemplate.delete({mailTemplateId:mTemplate.id}, function (res) {
        dbg.log2('#KliikoApp.mailTemplate > delete mail template> server respond >');
        $rootScope.$broadcast('updateSessionBuilderEmails', res);
        deferred.resolve(res);
      });
      return deferred.promise;
    }

    function resetMailTemplate(mTemplate) {
      dbg.log2('#KliikoApp.mailTemplate > reset mail template', mTemplate);
      var deferred = $q.defer();

      mailRestApi.resetMailTemplate.post({mailTemplateId: mTemplate.id, mailTemplateBaseId: mTemplate["MailTemplateBase.id"], isCopy: mTemplate.isCopy,}, function (res) {
        dbg.log2('#KliikoApp.mailTemplate > reset mail template> server respond >');
        deferred.resolve(res);
      });
      return deferred.promise;
    }

    function previewMailTemplate(mTemplate) {
      var deferred = $q.defer();

      mailRestApi.previewMailTemplate.post({mailTemplate:mTemplate}, function (res) {
        dbg.log2('#KliikoApp.mailTemplate > preview mail template> server respond >');
        deferred.resolve(res);
      });
      return deferred.promise;
    }

  }
})();
