(function () {
  'use strict';

  angular.module('KliikoApp').controller('EmailTemplateEditorController', EmailTemplateEditorController);

  EmailTemplateEditorController.$inject = ['dbg', 'sessionBuilderControllerServices', 'domServices', '$state', '$stateParams', '$scope', 'mailTemplate', 'GalleryServices', 'messenger', '$q', 'fileUploader'];
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

  function EmailTemplateEditorController(dbg, builderServices, domServices, $state, $stateParams, $scope, mailTemplate, GalleryServices, messenger, $q, fileUploader) {
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
    vm.headTemplate = null;
    vm.headPattern = /<head>[\S\s]*?<\/head>/gi;
    vm.isAccordionToggled = false;
    var showSystemMail = $stateParams.systemMail;

    vm.preInit = function(params) {
      if (params) {
        vm.properties = params;
      }
      vm.init();
    }

    $scope.$watch('sbc.accordions.emailTemplates', function() {
      vm.isAccordionToggled = true;
    });

    vm.init = function () {
      vm.emailTemplates = vm.emailTemplates.concat(vm.constantEmailTemplates);
      $('#templateContent').wysiwyg({
        events: {
          dragover: function(event) { event.preventDefault(); },
          drop: function(event) { event.preventDefault(); },
        },
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
                vm.galleryController.openSelectOrUploadModal(vm.uploadTypes.image, { modal: {}, callback: postUpload });
              });
            }
          }
        }
      });

      $('#templateContent').wysiwyg("addControl", "youtubeLinkR", {
        icon: "/icons/header button icons/addYoutubeVideo.png",
        visible: true,
        callbackArguments: [],
        tooltip: 'Add Video',
        exec: function() {
          vm.currentUpload = 'video';
          $scope.$apply(function() {
            vm.galleryController.openSelectOrUploadModal(vm.uploadTypes.video, { modal: {}, callback: postUpload });
          });
        }
      });

      $('#templateContent').wysiwyg("setContent", "");

      refreshTemplateList(function() {
        if (vm.emailTemplates && vm.emailTemplates.length) {
          vm.startEditingTemplate(0);
          var scrollable = $('#mail-template-list');
          var visibleFunc = debounce(function() {
            scrollable.children('span').each(function(index, child) {
              if(isVisible(child)) {
                $(child).addClass('scroll-visible');
              }
              else {
                $(child).removeClass('scroll-visible');
              }
            });
          }, 15);
          scrollable.scroll(visibleFunc);
        }
      });
    };

    vm.startEditingTemplate = startEditingTemplate;
    vm.modifyAndSave = modifyAndSave;
    vm.deleteTemplate = deleteTemplate;
    vm.resetMailTemplate = resetMailTemplate;
    vm.previewMailTemplate = previewMailTemplate;
    var selectedTemplate = {};
    vm.initGallery = initGallery;
    vm.galleryDropdownData = galleryDropdownData;
    vm.openModal = openModal;
    vm.findIndexFromId = findIndexFromId;
    vm.sendEmail = sendEmail;

    function setContent(content) {
      $('#templateContent').wysiwyg('setContent', content);
      vm.currentWysiwygProccessedTemplate = $('#templateContent').wysiwyg('getContent');
    }

    function getColors() {
      var object = {};
      for (var param in vm.defaultColors) {
        for (var color in vm.defaultColors[param]) {
          var name = vm.defaultColors[param][color].model;
          object[name] = vm.colors && vm.colors[name] ? vm.colors[name] : vm.defaultColors[param][color].colour;
        }
      }
      return object;
    }

    function startEditingTemplate(templateIndex, templateId, template, isResetingOrSaving) {
      if (isChangedAndNotSaved(isResetingOrSaving) && !vm.isAccordionToggled) {
        if (vm.properties.sessionId) {
          vm.warningMessage = "If you want to save the changes you have made to your email, you need to Apply them to Session."
        } else {
          vm.warningMessage = "If you want to save the changes you have made to your email, you need to Save them first."
        }
        domServices.modal('unsavedTemplateMsg');
        return;
      }

      vm.isAccordionToggled = false;

      if (!templateId) {
        templateId = template ? template.id : vm.emailTemplates[templateIndex].id;
      }

      if (templateId) {
        mailTemplate.getMailTemplate({id:templateId}).then(function (res) {
          if (res.error) return;

          if (vm.properties.brandLogoId && vm.properties.sessionId) {
            fileUploader.show(vm.properties.brandLogoId).then(function(result) {
              populateTemplate(res);
              $('#templateContent').wysiwyg('setContent', vm.currentTemplate.content);
              $('.wysiwyg iframe').contents().find("img#brandLogoUrl").attr("src", result.resource.url.full);
              vm.currentWysiwygProccessedTemplate = $('#templateContent').wysiwyg('getContent');
            });
          } else {

            populateTemplate(res);
            setContent(vm.currentTemplate.content);
          }
        });
      }

      function isChangedAndNotSaved(isResetingOrSaving) {
        var actualContent = $('#templateContent').wysiwyg('getContent');
        var initialContent = vm.currentWysiwygProccessedTemplate;
        return initialContent !== undefined && initialContent != actualContent && !isResetingOrSaving;
      }

      function populateContentWithColors() {
        var head =  vm.currentTemplate.content.match(vm.headPattern);
        vm.headTemplate = head ? head[0] : null;
        var colors = getColors();
        for (var color in colors) {
          vm.currentTemplate.content = vm.currentTemplate.content.replace("<%= " + color + " %>", colors[color]);
        }
      }

      function adjustSessionTimeSentenceIfFirstInvitation() {
        if(isFirstInvitationTemplate()) {
          if (isSessionBuilder()) {
            setSessionBuilderStartDateVisibility();
          } else {
            showStartDateSpan();
          }
        }

        function isFirstInvitationTemplate() {
          return vm.currentTemplate['MailTemplateBase.category'] == "firstInvitation";
        }

        function isSessionBuilder() {
          return $scope.step3Controller && $scope.step3Controller.session;
        }

        function setSessionBuilderStartDateVisibility() {
          if (isEndDateAfterStartDate()) {
            showStartDateSpan();
          } else {
            hideStartDateSpan();
          }
        }

        function hideStartDateSpan() {
          toggleStartDateSpan(/<span id=(\")*start-date-container(\")*>/g, "<span id=start-date-container style=display:none>");
        }

        function showStartDateSpan() {
          toggleStartDateSpan(/<span id=(\")*start-date-container(\")* style=(\")*display:none;(\")*>/g, "<span id=start-date-container>")
        }

        function toggleStartDateSpan(currentSpanRegEx, expectedSpan) {
          var currentContent = vm.currentTemplate.content;
          vm.currentTemplate.content = currentContent.replace(currentSpanRegEx, expectedSpan);
        }

        function isEndDateAfterStartDate() {
          var session = $scope.step3Controller.session;
          var startDate = new Date(session.startTime).setHours(0, 0, 0, 0);
          var endDate = new Date(session.endTime).setHours(0, 0, 0, 0);
          return endDate > startDate;
        }
      }

      function populateTemplate(res) {
        vm.currentTemplate = vm.emailTemplates[templateIndex];
        vm.currentTemplate.content = res.template.content;
        vm.currentTemplate.index = templateIndex;
        vm.currentTemplate.subject = res.template.subject;
        vm.currentTemplate.snapshot = res.snapshot;

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
        adjustSessionTimeSentenceIfFirstInvitation();
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
    function modifyAndSave(createCopy, templateData, includeProperties, templateName, createdFromModal, sessionId) {
      var deferred = $q.defer();
      var template = templateData || vm.currentTemplate;

      if(templateName) {
        domServices.modal('templateNameModal', true);
      }

      vm.currentTemplate.content = $('#templateContent').wysiwyg('getContent');
      if (vm.headTemplate) {
        vm.currentTemplate.content = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD XHTML 1.0 Strict//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd'><html xmlns='http://www.w3.org/1999/xhtml'>"
          + vm.headTemplate + "<body>" + vm.currentTemplate.content.substr(vm.currentTemplate.content.indexOf("<table")) + "</body></html>";
      }

      vm.currentTemplate.error = {};
      if (includeProperties) {
        template.properties = vm.properties;
        template.properties.createdWithCustomName = createdFromModal;
        template.properties.templateName = templateName;
        template.snapshot = vm.currentTemplate.snapshot;
      }
      mailTemplate.saveMailTemplate(template, createCopy, sessionId).then(function (res) {
        if (res.error) {
          template.error = null;
          template.properties = null;
          messenger.error(res.error);
          deferred.reject();
        } else if (res.ignored) {
          refreshTemplateList(function() {
            var index = getIndexOfMailTemplateWithId(template.id);
            if (index != -1) {
              vm.startEditingTemplate(index);
            }
          });
          deferred.resolve();
        } else {
          refreshTemplateList(function() {
            var index = getIndexOfMailTemplateWithId(res.templates.id);
            if (index != -1) {
              vm.startEditingTemplate(index, null, null, true);
            }
          });
          messenger.ok(res.message);
          deferred.resolve();
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

      refreshTemplateList(function() {
        vm.startEditingTemplate(vm.currentTemplate.index, null, null, true);
      });
    }

    function previewMailTemplate() {
      vm.currentTemplate.content = $('#templateContent').wysiwyg('getContent');
      var contentFrame = $("#contentFrame").contents().find('html');
      domServices.modal('previewMailTemplateModal');
      mailTemplate.previewMailTemplate(vm.currentTemplate, vm.properties.sessionId).then(function(res) {
        if (!res.error || angular.equals({}, res.error)) {
          //this is for case when preview button pressed after save but before server responce
          var template = res.template || vm.currentTemplate;
          contentFrame.html(template.content);
          $("#mailTemplatePreviewSubject").text(template.subject);
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

    function preprocessMailTemplateList(templates, callback) {
      vm.emailTemplates = templates;
      if (vm.emailTemplates.length && vm.currentTemplate == -1) {
        vm.startEditingTemplate(0);
      }

      // session builder section
      vm.emailTemplates.map(function(template) {
        if(!vm.addedList[template.id]) {
          vm.addedList[template.id] = template;
          if(!vm.sortedEmailTemplates[template["MailTemplateBase.name"]]) {
            vm.sortedEmailTemplates[template["MailTemplateBase.name"]] = [];
          }
          vm.sortedEmailTemplates[template["MailTemplateBase.name"]].push(template);
        } else {
          //in existing list - we set new items over existing. Items could be overwritten
          var nList = vm.sortedEmailTemplates[template["MailTemplateBase.name"]];
          for (var idx = 0; idx < nList.length; idx++) {
            if (nList[idx].id == template.id) {
              nList[idx] = template;
            }
          }
        }
      });
      callback();
    }

    function refreshTemplateList(callback) {
      (vm.properties.sessionBuilder ? mailTemplate.getAllSessionMailTemplatesWithColors : mailTemplate.getAllMailTemplatesWithColors)
          (showSystemMail, vm.properties, vm.properties.sessionBuilder ? builderServices.session.sessionData.brandProjectPreferenceId : null).then(function (res) {
        if (res.error) {
          messenger.error(res.error);
        } else {
          vm.colors = res.colors;
          vm.defaultColors = res.manageFields;
          preprocessMailTemplateList(res.templates, callback);
        }
      });
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

    function debounce(func, wait, immediate) {
      var timeout;
      return function() {
        var context = this, args = arguments;
        var later = function() {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    };

    function isVisible(el) {
      var rect = el.getBoundingClientRect(), top = rect.top, height = rect.height,
        el = el.parentNode;
      do {
        rect = el.getBoundingClientRect();
        if (top <= rect.bottom === false) return false;
        // Check if the element is out of view due to a container scrolling
        if (top+1 <= rect.top) return false
        el = el.parentNode;
      } while (el != document.body);
      // Check its within the document viewport
      return top <= document.documentElement.clientHeight;
    }

    function getVideoHTML(url, resourceId) {
      return '<a href="' + url + '" target="_blank" style="display:block;text-decoration:none;color:#000;" data-resource-id="' + resourceId + '"><img src="/icons/header button icons/videoLink.png"></img></a>';
    }

    function postUpload(resource) {
      var html = null;
      if (resource.type == 'image') {
        html = '<img src="' + resource.url.full + '" style="max-width:600px;" data-resource-id="' + resource.id + '"></img>';
      } else if (resource.type == 'video') {
        html = getVideoHTML(resource.url.full, resource.id);
      } else {
        var url = GalleryServices.prepareVideoServiceUrl(resource.url.full, resource.source);
        if (url != null) {
          html = getVideoHTML(url, resource.id);
        }
      }
      if (html) {
        $('#templateContent').wysiwyg("insertHtml", html);
      }
    }

    function initGallery(gc) {
      vm.galleryController = gc;
      vm.uploadTypes = {
        image: gc.getUploadType('image'),
        video: gc.getUploadType('video')
      };
    }

    function galleryDropdownData(dependency) {
      return {
        validation: 'uploadToGallery',
        types: vm.uploadTypes[vm.currentUpload],
        modal: { upload: true },
        dependency: dependency
      };
    }

    function openModal() {
      vm.templateNameAdd = null;
      domServices.modal('templateNameModal');
    }

    function sendEmail() {
      mailTemplate.sendMail(vm.currentTemplate, vm.properties.sessionId).then(function (res) {
          messenger.ok(res.message);
        }, function (error) {
          messenger.error(error);
      });
    }
  }
})();
