(function () {
  'use strict';
  
  angular.module('KliikoApp').controller('EmailTemplateEditorController', EmailTemplateEditorController);

  EmailTemplateEditorController.$inject = ['dbg', 'domServices', '$state', '$stateParams', '$scope', 'mailTemplate', 'user'];
  
  //necessary to bypass email viewers restrictions
  jQuery.browser = {};
    (function () {
        jQuery.browser.msie = false;
        jQuery.browser.version = 0;
        if (navigator.userAgent.match(/MSIE ([0-9]+)\./)) {
            jQuery.browser.msie = true;
            jQuery.browser.version = RegExp.$1;
        }
    })();
  
  function EmailTemplateEditorController(dbg, domServices, $state, $stateParams, $scope, mailTemplate, user) {
    dbg.log2('#EmailTemplateEditorController started');
    var vm = this;
    vm.currentTemplate = {index: 0};
    vm.emailTemplates = [];
    
    user.getUserData().then(function (res) {
        dbg.log2('#EmailTemplateEditorController > fetchInitData > userData fetched');
        /* gets data
        city, companyName, country, email, firstName, gender, id, landlineNumber, lastName, mobile, postalAddress, postcode, role, state, tipsAndUpdate
        */  
        vm.userData = res;
        vm.init();
    });
    
    vm.init = function () {
      vm.emailTemplates = vm.emailTemplates.concat(vm.constantEmailTemplates);
      $('#templateContent').wysiwyg({
        rmUnusedControls: true,
        controls: {
          bold: { visible : true },
          italic: { visible : true }
        }
      });
      $('#templateContent').wysiwyg("setContent", "");
      refreshTemplateList(function() {
        if (vm.emailTemplates && vm.emailTemplates.length) {
          vm.startEditingTemplate(0);
        }
      });
    }
    
    vm.startEditingTemplate = function(templateIndex) {        
      mailTemplate.getMailTemplate(vm.emailTemplates[templateIndex]).then(function (res) {
        if (res.error) {return;}
        
        vm.currentTemplate = jQuery.extend(true, {}, res.template);
        vm.currentTemplate.index = templateIndex;
        $('#templateContent').wysiwyg('setContent', vm.currentTemplate.content);
      });
    }
    
    vm.modifyAndSave = function() {
      vm.currentTemplate.content = $('#templateContent').wysiwyg('getContent');
      mailTemplate.saveMailTemplates(vm.currentTemplate).then(function (res) {
        if (!res.error) {
          refreshTemplateList(function() {
            var index = getIndexOfMailTemplateWithId(res.templates.id);
            if (index != -1) {
            vm.startEditingTemplate(index);
            }
          });
        }                  
      });
    }
    
    vm.deleteTemplate = function(template, key, event) {
      if(event) {
        event.stopPropagation();
        event.preventDefault();
      }
      
      var nextSelection = -1;
      if (key == vm.currentTemplate.index) {
        nextSelection = vm.currentTemplate.index - 1;    
      }
      
      mailTemplate.deleteMailTemplate(template).then(function (res) {
        refreshTemplateList(function(res) {
          if (nextSelection != -1) {
            vm.startEditingTemplate(nextSelection);
          }
        });
      });
    }
    
    function getIndexOfMailTemplateWithId(id) {
      for (var i = 0; i < vm.emailTemplates.length; i++) {
        if (vm.emailTemplates[i].id === id)
            return i;
      }
      return -1;
    }
    
    function refreshTemplateList(callback) {
        mailTemplate.getAllMailTemplates().then(function (res) {
        vm.emailTemplates = res.templates.sort(function(a, b){return a.id-b.id});;
        
        if (vm.emailTemplates && vm.emailTemplates.length && vm.currentTemplate == -1) {
          vm.startEditingTemplate(0);
        }
        
        if (callback) {
          callback();
        }
      });
    }
  }
})();
