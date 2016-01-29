(function () {
  'use strict';
  
  angular.module('KliikoApp').controller('EmailTemplateEditorController', EmailTemplateEditorController);

  EmailTemplateEditorController.$inject = ['dbg', 'domServices', '$state', '$stateParams', '$scope', 'mailTemplate', 'GalleryServices', 'messenger'];
  //necessary to bypass email editors restrictions
  jQuery.browser = {};
    (function () {
        jQuery.browser.msie = false;
        jQuery.browser.version = 0;
        if (navigator.userAgent.match(/MSIE ([0-9]+)\./)) {
            jQuery.browser.msie = true;
            jQuery.browser.version = RegExp.$1;
        }
    })();
  
  function EmailTemplateEditorController(dbg, domServices, $state, $stateParams, $scope, mailTemplate, GalleryServices, messenger) {
    dbg.log2('#EmailTemplateEditorController started');
    var vm = this;
    vm.currentTemplate = {index: 0};
    vm.emailTemplates = [];
    vm.templateToDelete;
    vm.newResource = {};
    
    var showSystemMail = $stateParams.systemMail;
    
    vm.init = function () {
      vm.emailTemplates = vm.emailTemplates.concat(vm.constantEmailTemplates);
      $('#templateContent').wysiwyg({
        rmUnusedControls: true,
        controls: {
          bold: { visible : true },
          italic: { visible : true },
          justifyLeft: { visible : true },
          justifyCenter: { visible : true },
          justifyRight: { visible : true },
          justifyFull: { visible : true },
          insertImage: { 
            visible : true,
            exec: function() {
              vm.uploadResourceForm('image');
            }
          }
        }
      });
      
      $('#templateContent').wysiwyg("addControl", "youtubeLinkR", {
        icon: "/icons/header button icons/addYoutubeVideo.png",
        visible: true,
        callbackArguments: [],
        tooltip: 'Add YouTube link',
        exec: function() {
          vm.uploadResourceForm('youtubeUrl');
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

        vm.currentTemplate = vm.emailTemplates[templateIndex];
        vm.currentTemplate.content = res.template.content;
        vm.currentTemplate.index = templateIndex;
        vm.currentTemplate.subject = res.template.subject;
        $('#templateContent').wysiwyg('setContent', vm.currentTemplate.content);
      });
    }
    
    vm.modifyAndSave = function(createCopy) {
      vm.currentTemplate.content = $('#templateContent').wysiwyg('getContent');
      vm.currentTemplate.error = {}; 
      mailTemplate.saveMailTemplate(vm.currentTemplate, createCopy).then(function (res) {
        if (!res.error) {
          refreshTemplateList(function() {
            var index = getIndexOfMailTemplateWithId(res.templates.id);
            if (index != -1) {
              vm.startEditingTemplate(index);
            }
          });
        } else {
          processErrors(res.error);
        }                  
      });
    }
        
    vm.deleteTemplate = function(template, key, event) {
      vm.templateToDelete = {template: template, key: key};
      domServices.modal('confirmDialog');
      
      if(event) {
        event.stopPropagation();
        event.preventDefault();
      }
    }
    
    vm.resetMailTemplate = function() {
      mailTemplate.resetMailTemplate(vm.currentTemplate).then(function (res) {
        if (!res.error) {
          refreshTemplateList(function() {
            vm.startEditingTemplate(vm.currentTemplate.index);
          });
        } else {
          messenger.error(res.error);
        }
      });
    }
    
    vm.previewMailTemplate = function() {
      vm.currentTemplate.content = $('#templateContent').wysiwyg('getContent');
      var contentFrame = $("#contentFrame").contents().find('html');
      domServices.modal('previewMailTemplateModal');
      mailTemplate.previewMailTemplate(vm.currentTemplate).then(function(res) {
        if (!res.error) {
          contentFrame.html(res.template.content);
          $("#mailTemplatePreviewSubject").html(res.template.subject);
        } else {
          messenger.error(res.error);
        }
      });
    }
    
    function processErrors(err) {
      if (!err) {
        return;
      }
      
      var errors = err.errors;
      for (var e in errors) {
          vm.currentTemplate.error[errors[e].path] = errors[e].message;
      }
    }
    
    function getIndexOfMailTemplateWithId(id) {
      for (var i = 0; i < vm.emailTemplates.length; i++) {
        if (vm.emailTemplates[i].id == id)
            return i;
      }
      return -1;
    }
    
    function refreshTemplateList(callback) {
      mailTemplate.getAllMailTemplates(showSystemMail).then(function (res) {
        vm.emailTemplates = res.templates;
        if (vm.emailTemplates.length && vm.currentTemplate == -1) {
          vm.startEditingTemplate(0);
        }

        callback();        
      });
    }
    
    vm.cancelTemplateDelete = function() {
      domServices.modal('confirmDialog', 'close');
    }
    
    vm.approveTemplateDelete = function() {
      domServices.modal('confirmDialog', 'close');
      var nextSelection = -1;
      if (vm.templateToDelete.key == vm.currentTemplate.index) {
        nextSelection = vm.currentTemplate.index - 1;    
      }
      
      mailTemplate.deleteMailTemplate(vm.templateToDelete.template).then(function (res) {
        refreshTemplateList(function(res) {
          if (nextSelection != -1) {
            vm.startEditingTemplate(nextSelection);
          }
        });
      });
    }
    
    vm.uploadResourceForm = function(uploadType) {
      vm.newResource.type = uploadType;
      vm.uploadTypeForTitle = uploadTypeForTitle(uploadType);

      domServices.modal('uploadTemplateResource');
    }
    
    function uploadTypeForTitle(uploadType) {
      if(uploadType == "youtubeUrl"){
        return "youtube";
      }
      return uploadType;
    }
    
    vm.submitForm = function(newResource) {
      if(newResource.type == "youtubeUrl"){
        saveYoutube(newResource);
      }else{
        saveResource(newResource);
      }
    };
    
    function cancel() {
      domServices.modal('uploadTemplateResource', 'close');
    }
    
    function saveYoutube(newResource){
      var resourceParams = {
        title: newResource.title,
        text: newResource.youtubeUrl
      };
      
      GalleryServices.saveYoutubeUrl(resourceParams).then(function(res) {
        if(res.error) {
          messenger.error(res.error);
        } else {
          var linkHTML = '<a href="' + res.url + '" target="_blank" style="display:block;text-decoration:none;color:#000;;"><img src="/icons/header button icons/tour_video.png"></img> </a>';
          $('#templateContent').wysiwyg("insertHtml", linkHTML);
          vm.newResource = {};
          cancel();
        }
      })
    }

    function saveResource(newResource){
      var resourceParams = {
        title: newResource.title,
        type: newResource.type,
        text: vm.newResource.fileTst.name,
        file: newResource.fileTst
      };

      GalleryServices.createResource(resourceParams).then(function(res) {
        if(res.error){
          messenger.error(res.error);
        } else {
          GalleryServices.postuploadData(resourceParams).then(function(res) {
            if(res.error) {
              messenger.error(res.error);
            } else {
              var linkHTML = '<img src="/chat_room/uploads/' + res.data.name + '" style="max-width:600px;"></img>';
              $('#templateContent').wysiwyg("insertHtml", linkHTML);
              vm.newResource = {};
              cancel()
            }
          })
        }
      })
    }
    
    vm.isCurrent = function(key) {
      return (key == vm.currentTemplate.index); 
    }
    
    vm.init();            
  }
})();
