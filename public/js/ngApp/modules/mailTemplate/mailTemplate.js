(function () {
  'use strict';

  angular.module('KliikoApp.mailTemplate', []).factory('mailTemplate', mailTemplateFactory);

  mailTemplateFactory.$inject = ['$q', 'globalSettings', '$resource', 'dbg', '$rootScope', 'changesValidation'];
  function mailTemplateFactory($q, globalSettings, $resource, dbg, $rootScope, changesValidation) {

    var mailRestApi = {
      mailTemplates: $resource('/mailTemplates', {}, {get: {method: 'GET'}}),
      mailTemplatesWithColors: $resource('/mailTemplatesWithColors', {}, { get: { method: 'GET' } }),
      sessionMailTemplates: $resource('/sessionMailTemplates', {}, { get: { method: 'GET' } }),
      sessionMailTemplatesWithColors: $resource('/sessionMailTemplatesWithColors', {}, { get: { method: 'GET' } }),
      mailTemplate: $resource('/mailTemplate', {}, {post: {method: 'POST'}}),
      saveMailTemplate: $resource('/mailTemplate/save', {}, {post: {method: 'POST'}}),
      deleteMailTemplate: $resource('/mailTemplate', {}, {post: {method: 'POST'}}),
      resetMailTemplate: $resource('/mailTemplate/reset', {}, {post: {method: 'POST'}}),
      previewMailTemplate: $resource('/mailTemplate/preview', {}, {post: {method: 'POST'}}),
      sendMail: $resource('/mailTemplate/send', {}, {post: {method: 'POST'}})
    };

    var MailTemplateService = {};
    MailTemplateService.getAllSessionMailTemplates = getAllSessionMailTemplates;
    MailTemplateService.getAllMailTemplates = getAllMailTemplates;
    MailTemplateService.getAllSessionMailTemplatesWithColors = getAllSessionMailTemplatesWithColors;
    MailTemplateService.getAllMailTemplatesWithColors = getAllMailTemplatesWithColors;
    MailTemplateService.saveMailTemplate = saveMailTemplate;
    MailTemplateService.saveTemplate = saveTemplate;
    MailTemplateService.getMailTemplate = getMailTemplate;
    MailTemplateService.deleteMailTemplate = deleteMailTemplate;
    MailTemplateService.resetMailTemplate = resetMailTemplate;
    MailTemplateService.previewMailTemplate = previewMailTemplate;
    MailTemplateService.sendMail = sendMail;
    return MailTemplateService;

    function getAllSessionMailTemplates(getSystemMail, params) {
      dbg.log2('#KliikoApp.mailTemplate > get all session mail templates for user');
      var deferred = $q.defer();
      mailRestApi.sessionMailTemplates.get({ getSystemMail: getSystemMail, params: params }, function (res) {
        dbg.log2('#KliikoApp.sessionMailTemplate > get all templates > server respond >');
        deferred.resolve(res);
      });
      return deferred.promise;
    }

    function getAllSessionMailTemplatesWithColors(getSystemMail, params, brandProjectPreferenceId) {
      dbg.log2('#KliikoApp.mailTemplate > get all session mail templates with colors for user');
      var deferred = $q.defer();
      mailRestApi.sessionMailTemplatesWithColors.get({ getSystemMail: getSystemMail, params: params, brandProjectPreferenceId: brandProjectPreferenceId }, function (res) {
        dbg.log2('#KliikoApp.sessionMailTemplate > get all templates with colors > server respond >');
        deferred.resolve(res);
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

    function getAllMailTemplatesWithColors(getSystemMail, brandProjectPreferenceId) {
      dbg.log2('#KliikoApp.mailTemplate > get all mail templates with colors for user');
      var deferred = $q.defer();
      mailRestApi.mailTemplatesWithColors.get({ getSystemMail: getSystemMail, brandProjectPreferenceId: brandProjectPreferenceId }, function (res) {
        dbg.log2('#KliikoApp.mailTemplate > get all templates with colors > server respond >');
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

    function saveMailTemplate(mTemplate, createCopy, sessionId) {
      dbg.log2('#KliikoApp.mailTemplate > save mail template', mTemplate);
      var deferred = $q.defer();
      mailRestApi.saveMailTemplate.post({mailTemplate:mTemplate, copy: createCopy, sessionId: sessionId}, function (res) {
        dbg.log2('#KliikoApp.mailTemplate > save mail template> server respond >');
        if (res.validation && !res.validation.isValid) {
          changesValidation.validationConfirmAlternative(res, saveMailTemplate, mTemplate, createCopy).then(function(newRes) {
            deferred.resolve(newRes);
          }, function(err) {
            deferred.reject(err);
          });
        } else {
          deferred.resolve(res);
        }
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

    function previewMailTemplate(mTemplate, sessionId) {
      var deferred = $q.defer();

      mailRestApi.previewMailTemplate.post({mailTemplate: mTemplate, sessionId: sessionId}, function (res) {
        dbg.log2('#KliikoApp.mailTemplate > preview mail template> server respond >');
        deferred.resolve(res);
      });
      return deferred.promise;
    }

    function sendMail(mailTemplate, sessionId) {
      var deferred = $q.defer();

      mailRestApi.sendMail.post({mailTemplate: mailTemplate, sessionId: sessionId}, function(res) {
        if (res.error) {
          deferred.reject(res.error);
        } else {
          deferred.resolve(res);
        }
      });

      return deferred.promise;
    }

  }
})();
