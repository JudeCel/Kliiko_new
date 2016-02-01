(function () {
  'use strict';

  angular.module('KliikoApp.mailTemplate', []).factory('mailTemplate', mailTemplateFactory);

  mailTemplateFactory.$inject = ['$q', 'globalSettings', '$resource', 'dbg'];
  function mailTemplateFactory($q, globalSettings, $resource, dbg) {
    
    var mailRestApi = {
      mailTemplates: $resource(globalSettings.restUrl + '/mailTemplates', {}, {get: {method: 'GET'}}),
      mailTemplate: $resource(globalSettings.restUrl + '/mailTemplate', {}, {post: {method: 'POST'}}),
      saveMailTemplate: $resource(globalSettings.restUrl + '/mailTemplate/save', {}, {post: {method: 'POST'}}),
      deleteMailTemplate: $resource(globalSettings.restUrl + '/mailTemplate', {}, {post: {method: 'POST'}}),
      resetMailTemplate: $resource(globalSettings.restUrl + '/mailTemplate/reset', {}, {post: {method: 'POST'}}),
      previewMailTemplate: $resource(globalSettings.restUrl + '/mailTemplate/preview', {}, {post: {method: 'POST'}}),
    };

    var MailTemplateService = {};
    MailTemplateService.getAllMailTemplates = getAllMailTemplates;
    MailTemplateService.saveMailTemplate = saveMailTemplate;
    MailTemplateService.getMailTemplate = getMailTemplate;
    MailTemplateService.deleteMailTemplate = deleteMailTemplate;
    MailTemplateService.resetMailTemplate = resetMailTemplate;
    MailTemplateService.previewMailTemplate = previewMailTemplate;
    return MailTemplateService;

    function getAllMailTemplates(getSystemMail) {
      dbg.log2('#KliikoApp.mailTemplate > get all mail templates for user');
      var deferred = $q.defer();

      mailRestApi.mailTemplates.get({getSystemMail:getSystemMail}, function (res) {
        dbg.log2('#KliikoApp.mailTemplate > get all templates> server respond >', res);
        deferred.resolve(res);
      });
      return deferred.promise;
    }
    
    function getMailTemplate(req) {
      dbg.log2('#KliikoApp.mailTemplate > get mail template', req);
      var deferred = $q.defer();
      mailRestApi.mailTemplate.post({mailTemplate:req}, function (res) {
        dbg.log2('#KliikoApp.mailTemplate > get get mail template> server respond >', res);
        deferred.resolve(res);
      });
      return deferred.promise;
    }
    
    function saveMailTemplate(mTemplate, createCopy) {
      dbg.log2('#KliikoApp.mailTemplate > save mail template', mTemplate);
      var deferred = $q.defer();

      mailRestApi.saveMailTemplate.post({mailTemplate:mTemplate, copy: createCopy}, function (res) {
        dbg.log2('#KliikoApp.mailTemplate > save mail template> server respond >', res);
        deferred.resolve(res);
      });
      return deferred.promise;
    }
    
    function deleteMailTemplate(mTemplate) {
      dbg.log2('#KliikoApp.mailTemplate > delete mail template', mTemplate);
      var deferred = $q.defer();

      mailRestApi.deleteMailTemplate.delete({mailTemplateId:mTemplate.id}, function (res) {
        dbg.log2('#KliikoApp.mailTemplate > delete mail template> server respond >', res);
        deferred.resolve(res);
      });
      return deferred.promise;
    }
    
    function resetMailTemplate(mTemplate) {
      dbg.log2('#KliikoApp.mailTemplate > reset mail template', mTemplate);
      var deferred = $q.defer();

      mailRestApi.resetMailTemplate.post({mailTemplateId:mTemplate.id}, function (res) {
        dbg.log2('#KliikoApp.mailTemplate > reset mail template> server respond >', res);
        deferred.resolve(res);
      });
      return deferred.promise;
    }
    
    function previewMailTemplate(mTemplate) {
      //dbg.log2('#KliikoApp.mailTemplate > preview mail template', mTemplate);
      var deferred = $q.defer();

      mailRestApi.previewMailTemplate.post({mailTemplate:mTemplate}, function (res) {
        dbg.log2('#KliikoApp.mailTemplate > preview mail template> server respond >', res);
        deferred.resolve(res);
      });
      return deferred.promise;
    }
    
  }
})();

