(function () {
  'use strict';

  angular.module('KliikoApp.mailTemplate', []).factory('mailTemplate', mailTemplateFactory);

  mailTemplateFactory.$inject = ['$q', 'globalSettings', '$resource', 'dbg'];
  function mailTemplateFactory($q, globalSettings, $resource, dbg) {
    
    var mailRestApi = {
      mailTemplates: $resource(globalSettings.restUrl + '/mailTemplates', {}, {get: {method: 'GET'}}),
      mailTemplate: $resource(globalSettings.restUrl + '/mailTemplate', {}, {post: {method: 'POST'}}),
      saveMailTemplate: $resource(globalSettings.restUrl + '/mailTemplates/save', {}, {post: {method: 'POST'}})
    };

    var MailTemplateService = {};
    MailTemplateService.getAllMailTemplates = getAllMailTemplates;
    MailTemplateService.saveMailTemplates = saveMailTemplate;
    MailTemplateService.getMailTemplate = getMailTemplate;
    return MailTemplateService;

    function getAllMailTemplates() {
      dbg.log2('#KliikoApp.mailTemplate > get all mail templates for user');
      var deferred = $q.defer();

      mailRestApi.mailTemplates.get({}, function (res) {
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
    
    function saveMailTemplate(mTemplate) {
      dbg.log2('#KliikoApp.mailTemplate > save mail template', mTemplate);
      var deferred = $q.defer();

      mailRestApi.saveMailTemplate.post({mailTemplate:mTemplate}, function (res) {
        dbg.log2('#KliikoApp.mailTemplate > save mail template> server respond >', res);
        deferred.resolve(res);
      });
      return deferred.promise;
    }
  }
})();

