(function () {
  'use strict';

  angular.module('KliikoApp').controller('SessionStep3Controller', SessionStep3Controller);

  SessionStep3Controller.$inject = ['dbg', 'sessionBuilderControllerServices', 'messenger', '$state',  '$filter', '$scope', 'SessionModel', 'domServices'];
  function SessionStep3Controller(dbg, builderServices, messenger, $state, $filter, $scope, SessionModel, domServices) {
    dbg.log2('#SessionBuilderController 3 started');
    var vm = this;
    vm.mailTemplateList = [];
    vm.session = builderServices.session;

    vm.getPreparedMailTemplateList = function() {
      vm.session.getSessionMailTemplateStatus().then(function(res) {
        vm.mailTemplateList = res.templates;
      }, function (err) {
        messenger.error(err);
      });
    }

    vm.isTemplateRequired = function(template) {
      if(template && template['MailTemplateBase.name'] == "Generic") {
        return "(optional)";
      }
      else {
        return "*";
      }
    }

    vm.getPreparedMailTemplateList();

    vm.templateName = function(baseName) {
      return baseName;
    }

    vm.isCreated = function(template) {
      var className = 'glyphicon';
      var typeClass = ' glyphicon-remove';
      vm.mailTemplateList.map(function(item) {
        if(isTemplateCreated(template, item)) {
          return typeClass = ' glyphicon-ok';
        }
      });

      return className + typeClass;
    }

    function isTemplateCreated(template, item) {
      return (template && item.id == template.id && item.created == true);
    }

    vm.resetMailTemplate = function() {
      vm.editor.resetMailTemplate();
    }

    vm.deleteTemplate = function(t, key, $event) {
      vm.editor.deleteTemplate(t, key, $event).then(function() {
        vm.getPreparedMailTemplateList();
      }, function() {
        //failure is handled in mail template controller. This is a wrapper
      });
    }

    vm.modifyAndSave = function(createCopy, addSessionInfo) {
      //null - will pickup current template
      if(vm.templateNameAdd) {
        domServices.modal('templateNameModal', true);
      }
      vm.editor.modifyAndSave(createCopy, null ,addSessionInfo, vm.templateNameAdd).then(function() {
        vm.getPreparedMailTemplateList();
      }, function() {
        //failure is handled in mail template controller. This is a wrapper
      });
    }
  }

})();
