(function () {
  'use strict';

  angular.module('KliikoApp').controller('EmailTemplateEditorController', EmailTemplateEditorController);

  EmailTemplateEditorController.$inject = ['dbg', 'sessionBuilderControllerServices', 'brandColourServices', 'domServices', '$state', '$stateParams', '$scope', 'mailTemplate', 'GalleryServices', 'messenger', '$q', 'fileUploader'];
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

  function EmailTemplateEditorController(dbg, builderServices, brandColourServices, domServices, $state, $stateParams, $scope, mailTemplate, GalleryServices, messenger, $q, fileUploader) {
    dbg.log2('#EmailTemplateEditorController started');

    var vm = this;
    vm.currentTemplate = {index: 0};
    vm.emailTemplates = [];
    vm.sortedEmailTemplates = {};
    vm.addedList = {};
    vm.templateToDelete;
    vm.properties = {};
    vm.colors = {};
    vm.defaultColors = {};
    vm.currentUpload = 'image';
    var showSystemMail = $stateParams.systemMail;

    vm.preInit = function(params) {
      if (params) {
        vm.properties = params;
      }
      vm.init();
    }

    vm.init = function () {
      brandColourServices.getAllSchemes().then(function (res) {
        if (res.manageFields) {
          vm.defaultColors = res.manageFields;
        }
        if (res.data) {
          res.data.forEach(function (el) {
            if (builderServices.session.sessionData.brandProjectPreferenceId == el.id) vm.colors = el.colours;
          });
        }
      });

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
              vm.currentUpload = 'image';
              $scope.$apply(function() {
                vm.galleryController.openUploadModal(vm.uploadTypes.image, { modal: {}, callback: postUpload });
              });
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
          vm.currentUpload = 'video';
          $scope.$apply(function() {
            vm.galleryController.openUploadModal(vm.uploadTypes.video, { modal: {}, callback: postUpload });
          });
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
    var selectedTemplate = {};
    vm.initGallery = initGallery;
    vm.galleryDropdownData = galleryDropdownData;
    vm.openModal = openModal;
    vm.findIndexFromId = findIndexFromId;

    function setContent(content) {
      $('#templateContent').wysiwyg('setContent', content);
    }
      
    function getColors() {
      let object = {};
      for (var param in vm.defaultColors) {
        for (var color in vm.defaultColors[param]) {
          var name = vm.defaultColors[param][color].model;
          object[name] = vm.colors && vm.colors[name] ? vm.colors[name] : vm.defaultColors[param][color].colour;
        }
      }
      return object;
    }

    function startEditingTemplate(templateIndex, inSession, templateId, template) {

      if (!templateId) {
        templateId = template ? template.id : vm.emailTemplates[templateIndex].id;
      }

      if (templateId) {
        mailTemplate.getMailTemplate({id:templateId}).then(function (res) {
          if (res.error) return;

          if (vm.properties.brandLogoId && inSession) {
            fileUploader.show(vm.properties.brandLogoId).then(function(result) {
              populateTemplate(res);
              setContent(vm.currentTemplate.content);
              $('.wysiwyg iframe').contents().find("img#brandLogoUrl").attr("src", result.resource.url.full);
            });
          }else{
            populateTemplate(res);
            setContent(vm.currentTemplate.content);
          }
        });
      }

      function populateContentWithColors() {
        var colors = getColors();
        for (var color in colors) {
          var param = "/*" + color + "*/";
          //todo: use regexp here
          vm.currentTemplate.content = vm.currentTemplate.content.replace(param, /*param +*/ colors[color]);
        }
      }

      function populateTemplate(res) {
        vm.currentTemplate = vm.emailTemplates[templateIndex];
        vm.currentTemplate.content = res.template.content;
        vm.currentTemplate.index = templateIndex;
        vm.currentTemplate.subject = res.template.subject;

        if(!vm.currentTemplate.isCopy) {
          vm.viewingTemplateId = vm.currentTemplate.id;
          vm.viewingTemplateName = vm.currentTemplate["MailTemplateBase.name"];
        }
        else {
          if(!vm.currentTemplate.sessionId) {
            vm.viewingTemplateId = vm.currentTemplate.MailTemplateBaseId;
            vm.viewingTemplateName = vm.currentTemplate["MailTemplateBase.name"];
          }
          else if(!vm.addedList[vm.currentTemplate.id]) {
            vm.viewingTemplateId = null;
            vm.viewingTemplateName = null;
          }
        }

        populateContentWithColors();
      }

    }

    function findIndexFromId(id) {
      for(var i in vm.emailTemplates) {
        if(vm.emailTemplates[i].id == id) {
          return i;
        }
      }
    }

    /**
     *
     * @param createCopy {boolean}
     * @param [template] {object} default valuse is currentTemplate
     */
    function modifyAndSave(createCopy, template, includeProperties, templateName) {
      var deferred = $q.defer();
      var template = template || vm.currentTemplate;

      if(templateName) {
        domServices.modal('templateNameModal', true);
      }

      vm.currentTemplate.content = $('#templateContent').wysiwyg('getContent');
      vm.currentTemplate.error = {};
      if (includeProperties) {
        template.properties = vm.properties;
        template.properties.templateName = templateName;
      }
      mailTemplate.saveMailTemplate(template, createCopy).then(function (res) {
        if (!res.error) {
          refreshTemplateList(function() {
            var index = getIndexOfMailTemplateWithId(res.templates.id);
            if (index != -1) {
              vm.startEditingTemplate(index);
            }
          });
          messenger.ok(res.message);
          deferred.resolve();
        } else {
          messenger.error(res.error);
          deferred.reject();
        }
      });

      return deferred.promise;
    }

    function deleteTemplate(template, key, event) {
      var deferred = $q.defer();
      vm.templateToDelete = {template: template, key: key, deferred: deferred};
      domServices.modal('confirmDialog');

      if(event) {
        event.stopPropagation();
        event.preventDefault();
      }
      return deferred.promise;
    }

    function resetMailTemplate() {
      var deferred = $q.defer();
      mailTemplate.resetMailTemplate(vm.currentTemplate).then(function (res) {
        if (!res.error) {
          refreshTemplateList(function() {
            vm.startEditingTemplate(vm.currentTemplate.index);
            deferred.resolve();
          });
        } else {
          messenger.error(res.error);
          deferred.reject();
        }
      });

      return deferred.promise;
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
      var deferred = $q.defer();
      vm.currentTemplate.properties = vm.properties;

      if (force) {
        vm.currentTemplate.content = $('#templateContent').wysiwyg('getContent');
      }
      mailTemplate.saveTemplate(vm.currentTemplate).then(function (res) {
        if (!res.error) {
          refreshTemplateList(function() {
            var index = getIndexOfMailTemplateWithId(res.templates.id);
            if (index != -1) {
              vm.startEditingTemplate(index);
            }
            deferred.resolve();
          });
          messenger.ok(res.message);
        } else {
          messenger.error(res.error);
          deferred.reject();
        }
      });

      return deferred.promise;
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
      vm.emailTemplates.map(function(template) {
        var sessionBuilder = template.isCopy && !template.sessionId && !vm.addedList[template.id] && vm.properties.sessionBuilder;
        var normal = !vm.addedList[template.id] && !vm.properties.sessionBuilder;

        if(sessionBuilder || normal) {
          vm.addedList[template.id] = template;
          if(vm.sortedEmailTemplates[template["MailTemplateBase.name"]]) {
            vm.sortedEmailTemplates[template["MailTemplateBase.name"]].push(template);
          }
          else {
            vm.sortedEmailTemplates[template["MailTemplateBase.name"]] = [template];
          }
        }
      });
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

    vm.resetButtonVisible = function(isAdmin) {
      return isAdmin || vm.currentTemplate.isCopy;
    }

    vm.copyButtonVisible = function(isAdmin) {
      return !vm.currentTemplate.systemMessage && !isAdmin;
    }

    vm.approveTemplateDelete = function() {
      domServices.modal('confirmDialog', 'close');
      var nextSelection = -1;
      if (vm.templateToDelete.key == vm.currentTemplate.index) {
        nextSelection = vm.currentTemplate.index - 1;
      }

      mailTemplate.deleteMailTemplate(vm.templateToDelete.template).then(function (res) {
        var template = vm.templateToDelete.template;
        if(vm.addedList[template.id]) {
          delete vm.addedList[template.id];
          var array = [];
          for(var t in vm.sortedEmailTemplates[template["MailTemplateBase.name"]]) {
            var temp = vm.sortedEmailTemplates[template["MailTemplateBase.name"]][t];
            if(temp.id != template.id) {
              array.push(temp);
            }
          }
          vm.sortedEmailTemplates[template["MailTemplateBase.name"]] = array;
        }

        refreshTemplateList(function(res) {
          if (nextSelection != -1) {
            vm.startEditingTemplate(nextSelection);
          }
          else {
            vm.startEditingTemplate(findIndexFromId(template.MailTemplateBaseId));
          }

          vm.templateToDelete.deferred.resolve();
        });
      });
    };

    vm.isCurrent = function(key) {
      return (key == vm.currentTemplate.index);
    }

    vm.isCurrentId = function(id) {
      return (id == vm.currentTemplate.id);
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

    function postUpload(resource) {
      if(resource.type == 'image') {
        var linkHTML = '<img src="' + resource.url.full + '" style="max-width:600px;"></img>';
        $('#templateContent').wysiwyg("insertHtml", linkHTML);
      }
      else {
        var linkHTML = '<a href="https://www.youtube.com/watch?v=' + resource.url.full + '" target="_blank" style="display:block;text-decoration:none;color:#000;"><img src="/icons/header button icons/videoLink.png"></img> </a>';
        $('#templateContent').wysiwyg("insertHtml", linkHTML);
      }
    }

    function initGallery(gc) {
      vm.galleryController = gc;
      vm.uploadTypes = {
        image: gc.getUploadType('image'),
        video: gc.getUploadType('youtube')
      };
    }

    function galleryDropdownData(dependency) {
      return {
        types: vm.uploadTypes[vm.currentUpload],
        modal: { upload: true },
        dependency: dependency
      };
    }

    function openModal() {
      vm.templateNameAdd = null;
      domServices.modal('templateNameModal');
    }
  }
})();
