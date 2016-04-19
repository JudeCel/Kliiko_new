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
    var selectedTemplate;
    vm.currentTemplate = {index: 0};
    vm.emailTemplates = [];
    vm.templateToDelete;
    vm.newResource = {};
    vm.properties = {};
    var showSystemMail = $stateParams.systemMail;

    vm.preInit = function(params) {
      if (params) {
        vm.properties = params;
      }
      vm.init();
    }

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




    };

    vm.startEditingTemplate = startEditingTemplate;
    vm.modifyAndSave = modifyAndSave;
    vm.deleteTemplate = deleteTemplate;
    vm.resetMailTemplate = resetMailTemplate;
    vm.previewMailTemplate = previewMailTemplate;
    vm.saveEmailTemplate = saveEmailTemplate;




    function startEditingTemplate(templateIndex, inSession, templateId, template) {
      if (template)  selectedTemplate = template;
      if (templateId) {
        mailTemplate.getMailTemplate({id:templateId}).then(function (res) {
          if (res.error) return;
          //vm.currentTemplate = vm.emailTemplates[templateIndex];
          populateTemplate(res);
        });
        return;
      }
      if (!inSession) {
        mailTemplate.getMailTemplate(vm.emailTemplates[templateIndex]).then(function (res) {
          if (res.error) return;
          vm.currentTemplate = vm.emailTemplates[templateIndex];
          populateTemplate(res);
        });
      } else {
        mailTemplate.getMailTemplate(vm.emailTemplatesForSessionBuilder[templateIndex]).then(function (res) {
          if (res.error) return;
          vm.currentTemplate = vm.emailTemplatesForSessionBuilder[templateIndex];
          populateTemplate(res);
        });
      }

      function populateTemplate(res) {
        vm.currentTemplate.content = res.template.content;
        vm.currentTemplate.index = templateIndex;
        vm.currentTemplate.subject = res.template.subject;
        $('#templateContent').wysiwyg('setContent', vm.currentTemplate.content);
      }


    }

    /**
     *
     * @param createCopy {boolean}
     * @param [template] {object} default valuse is currentTemplate
     */
    function modifyAndSave(createCopy, template) {
      var template = template || vm.currentTemplate;

      vm.currentTemplate.content = $('#templateContent').wysiwyg('getContent');
      vm.currentTemplate.error = {};
      template.properties = vm.properties;
      mailTemplate.saveMailTemplate(template, createCopy).then(function (res) {
        if (!res.error) {
          refreshTemplateList(function() {
            var index = getIndexOfMailTemplateWithId(res.templates.id);
            if (index != -1) {
              vm.startEditingTemplate(index);
            }
          });
          messenger.ok("Template was successfully saved.");
        } else {
          messenger.error(res.error);
        }
      });
    }

    function deleteTemplate(template, key, event) {
      vm.templateToDelete = {template: template, key: key};
      domServices.modal('confirmDialog');

      if(event) {
        event.stopPropagation();
        event.preventDefault();
      }
    }

    function resetMailTemplate() {
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

    function previewMailTemplate() {
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

    function saveEmailTemplate(force) {
      selectedTemplate.subject = vm.currentTemplate.subject;
      selectedTemplate.content = vm.currentTemplate.content;
      selectedTemplate.properties = vm.properties;

      if (force) {
        selectedTemplate.content = $('#templateContent').wysiwyg('getContent');
      }
      mailTemplate.saveTemplate(selectedTemplate).then(function (res) {
        if (!res.error) {
          refreshTemplateList(function() {
            var index = getIndexOfMailTemplateWithId(res.templates.id);
            if (index != -1) {
              vm.startEditingTemplate(index);
            }
          });
          messenger.ok("Template was successfully saved.");
        } else {
          messenger.error(res.error);
        }
      });
    }

    function getIndexOfMailTemplateWithId(id) {
      for (var i = 0; i < vm.emailTemplates.length; i++) {
        if (vm.emailTemplates[i].id == id)
            return i;
      }
      return -1;
    }

    function preprocessMailTemplateList(res, callback) {
      vm.emailTemplates = res.templates;
      if (vm.emailTemplates.length && vm.currentTemplate == -1) {
        vm.startEditingTemplate(0);
      }

      // session builder section
      vm.emailTemplatesForSessionBuilder = vm.emailTemplates;
      callback();
    }

    function refreshTemplateList(callback) {
      if (vm.properties.sessionBuilder) {
        mailTemplate.getAllSessionMailTemplates(showSystemMail, vm.properties).then(function (res) {
          preprocessMailTemplateList(res, callback);
        });
      } else {
        mailTemplate.getAllMailTemplates(showSystemMail, vm.properties).then(function (res) {
          preprocessMailTemplateList(res, callback);
        });
      }
    }

    vm.cancelTemplateDelete = function() {
      domServices.modal('confirmDialog', 'close');
    };

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
    };

    vm.uploadResourceForm = function(uploadType) {
      domServices.modal('uploadTemplateResource');
      vm.newResource.type = uploadType;
      vm.uploadTypeForTitle = uploadTypeForTitle(uploadType);
      if(!$scope.$$phase) {
        $scope.$apply();
      }
    };

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
          var linkHTML = '<a href="' + res.JSON.url + '" target="_blank" style="display:block;text-decoration:none;color:#000;"><img src="/icons/header button icons/videoLink.png"></img> </a>';
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
              var linkHTML = '<img src="/chat_room/uploads/' + res.data.JSON.name + '" style="max-width:600px;"></img>';
              $('#templateContent').wysiwyg("insertHtml", linkHTML);
              vm.newResource = {};
              cancel();
            }
          })
        }
      })
    }

    vm.isCurrent = function(key) {
      return (key == vm.currentTemplate.index);
    }

    vm.isEditable = function(item, canOverwrite) {
      if (!item) {
        return false;
      }

      if (canOverwrite) {
        return (item.AccountId || item.isCopy);
      }

      return item.AccountId;
    }
  }
})();
