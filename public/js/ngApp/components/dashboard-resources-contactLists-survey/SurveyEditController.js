(function () {
  'use strict';

  angular.module('KliikoApp').controller('SurveyEditController', SurveyController);
  SurveyController.$inject = ['dbg', 'surveyServices', 'angularConfirm', 'messenger', '$timeout', '$interval', '$anchorScroll', '$location', '$window', 'errorMessenger', 'domServices', '$scope', '$q'];

  function SurveyController(dbg, surveyServices, angularConfirm, messenger, $timeout, $interval, $anchorScroll, $location, $window, errorMessenger, domServices, $scope, $q) {
    dbg.log2('#SurveyController started');

    var vm = this;
    vm.uploadTypes = {};
    vm.autoSave = null;
    vm.onChangeAutoSave = false;
    vm.stats = {};
    vm.hasChanges = false;

    vm.defaultIntroduction = "(Brand/Organisation) would like your fast feedback on (issue). It will only take 2 minutes, and you'll be in the draw for (prize). Thanks for your help!";
    vm.defaultThanks = "Thanks for all your feedback and help with our survey! We'll announce the lucky winner of the draw for (prize) on (Facebook/website) on (date).";

    // Uses services
    vm.saveSurvey = saveSurvey;
    // Inits
    vm.init = init;
    vm.initQuestion = initQuestion;
    vm.initAnswers = initAnswers;
    vm.initContacts = initContacts;
    vm.initGallery = initGallery;
    vm.initAutoSave = initAutoSave;
    vm.changed = changed;
    vm.autoSaveChanges = autoSaveChanges;

    // Helpers
    vm.showPreview = showPreview;
    vm.replaceErrorMessage = replaceErrorMessage;
    vm.canChangeAnswers = canChangeAnswers;
    vm.changeAnswers = changeAnswers;
    vm.defaultArray = defaultArray;
    vm.addContactDetail = addContactDetail;
    vm.pickValidClass = surveyServices.pickValidClass;
    vm.changeQuestions = changeQuestions;
    vm.contactDetailDisabled = contactDetailDisabled;
    vm.onDropComplete = onDropComplete;
    vm.galleryDropdownData = galleryDropdownData;
    vm.checkTag = surveyServices.checkTag;
    vm.sectionQuestions = sectionQuestions;
    vm.questionTemplate = questionTemplate;
    vm.disableEdit = disableEdit;
    vm.btoonPostfix = btoonPostfix;

    vm.displaySaveButton = true;
    vm.displayPublishButton = true;
    vm.displayPreviewButton = true;

    vm.customSurveyTemplate = function(object) {
      var template;
      if (vm.surveySettings.userTemplates) {
        template = vm.surveySettings.userTemplates[object.tag];
      }
      return template ? template : "/js/ngApp/components/dashboard-resources-contactLists-survey/recruiter/empty-header.html";
    }

    vm.userTemplates = {};

    function onDropComplete(index, data, evt) {
      var answer = data.answer;
      var question = vm.survey.SurveyQuestions[data.questionOrder].answers;
      answer.order = index;

      var otherObj = question[index];
      var otherIndex = question.indexOf(answer);
      otherObj.order = otherIndex;

      question[index] = answer;
      question[otherIndex] = otherObj;
    }

    function showPreview() {
      var selected = findSelected();
      vm.previewSurvey = JSON.parse(JSON.stringify(vm.survey));
      vm.previewSurvey.SurveyQuestions = selected;
    }

    function replaceErrorMessage(error, type) {
      if(vm.minsMaxs) {
        return error.message.replace('XXX', vm.minsMaxs[type].max);
      }
    }

    function initConstants() {
      return surveyServices.getConstants(vm.surveySettings.surveyType).then(function(res) {
        vm.defaultQuestions = res.data.defaultQuestions;
        vm.contactDetails = res.data.contactDetails;
        vm.constantErrors = res.data.validationErrors;
        vm.validationErrors = vm.constantErrors.field;
        vm.minsMaxs = res.data.minsMaxs;
        vm.minQuestions = res.data.minQuestions;
        vm.tableOfContents = res.data.tableOfContents;
      });
    };

    function checkButtonVisibilityValue(val) {
      if ( val != undefined ) {
        return val;
      } else {
        return true;
      }
    }

    function validateSurveySettings(surveySettings) {
      if (!surveySettings || !surveySettings.surveyType) {
        throw "Survey editor must accept settings and type";
      } else {
        vm.displayPreviewButton = checkButtonVisibilityValue(surveySettings.showPreviewButton);
        vm.displaySaveButton = checkButtonVisibilityValue(surveySettings.showSaveButton);
        vm.displayPublishButton = checkButtonVisibilityValue(surveySettings.showPublishButton);
      }
    }

    function init(surveyId, surveySettings) {
      validateSurveySettings(surveySettings);
      vm.surveySettings = surveySettings;
      initConstants().then(function() {
        if (surveyId) {
          return surveyServices.findSurvey( {id: surveyId, skipValidations: true} );
        }
      }).then(function(res) {
        startSurveyEdit(res ? res.data : null);
        vm.hasChanges = false;
      });
    };
    function btoonPostfix(question, survey){
      var text = "";
      if (question.active) {
        text = text + "Disable"
      } else {
        text = text + "Enable"
      }
      if(vm.survey.surveyType == "sessionContactList"){
        text = text + " First Choice"
      }

      return text;
    }
    function processSurveyData(survey) {
      if(survey && survey.SurveyQuestions instanceof Array) {
        if (vm.surveySettings.notPublished) {
          survey.confirmedAt = null;
        }
        var object = {};
        for(var i in survey.SurveyQuestions) {
          var question = survey.SurveyQuestions[i];
          object[question.order] = question;
        }
        for(var i in vm.defaultQuestions) {
          var question = vm.defaultQuestions[i];
          if(!object[question.order]) {
            object[question.order] = defaultQuestionParams(question);
          }
        }
        survey.SurveyQuestions = object;
      }
    }

    function setupSurveyParameters() {
      if (!vm.survey.name && vm.surveySettings.defaultSurveyName) {
        vm.survey.name = vm.surveySettings.defaultSurveyName;
      }
      vm.survey.surveyType = vm.surveySettings.surveyType;
    }

    function startSurveyEdit(survey) {
      processSurveyData(survey);
      vm.submitedForm = false;
      vm.submitError = null;
      vm.currentContacts = null;
      vm.survey = survey || defaultSurveyData();
      setupSurveyParameters();
    }

    function findSelected() {
      var array = [];
      for(var i in vm.survey.SurveyQuestions) {
        var question = vm.survey.SurveyQuestions[i];
        if(question.active) {
          array.push(question);
        }
      }
      return array;
    }

    function initAutoSave(onChangeAutoSave) {
      vm.autoSave = $interval(function() {
        if (vm.hasChanges) {
          saveSurvey(true, false);
        }
      }, 60000, 0, false);
      vm.onChangeAutoSave = onChangeAutoSave;
    }

    function changed() {
      vm.hasChanges = true;
    }

    function autoSaveChanges(forceHasChanges) {
      if (vm.onChangeAutoSave && (forceHasChanges || vm.hasChanges)) {
        saveSurvey(true, false);
      }
    }

    function saveSurvey(autoSave, publish, skipMessage) {
      var deferred = $q.defer();
      vm.submitedForm = true;
      if (vm.manageForm.$valid) {
        var selected = findSelected();
        if (publish && selected.length < vm.minQuestions) {
          vm.submitError = vm.constantErrors.minQuestions + vm.minQuestions;
          deferred.resolve();
        } else {
          delete vm.submitError;
          var object = JSON.parse(JSON.stringify(vm.survey));
          object.SurveyQuestions = selected;
          if (!object.id) {
            return finishCreate(object, autoSave, publish, skipMessage);
          } else {
            return finishEdit(object, autoSave, publish, skipMessage);
          }
        }
      } else if (!autoSave) {
        vm.submitError = vm.constantErrors.default;
        var elem = angular.element('#manageForm .ng-invalid');
        var panel = elem.parents('.panel:first');
        var panelParent = panel.scope().$parent;
        var timeoutForAnimation = 10;
        if (panelParent.hasOwnProperty('accordion')) {
          panelParent.object.open = true;
        } else if (vm.surveySettings && !vm.surveySettings.expanded) {
          vm.surveySettings.expanded = true;
          timeoutForAnimation = 250;
        }
        moveBrowserTo(panel[0], timeoutForAnimation);

        deferred.reject();
      }
      return deferred.promise;
    }

    function quitEditor() {
      if (vm.surveySettings.onFinished) {
        vm.surveySettings.onFinished();
      }
    }

    function onSaved() {
      if (vm.surveySettings.onSaved) {
        vm.surveySettings.onSaved(vm.survey.id);
      }
    }

    function disableEdit() {
      vm.formDisabled = true;
      stopAutosave();
    }

    function finishCreate(survey, autoSave, publish, skipMessage) {
      var deferred = $q.defer();
      vm.submitingForm = true;
      surveyServices.createSurvey(survey).then(function(res) {
        vm.submitingForm = false;
        dbg.log2('#SurveyController > finishCreate > res ', res);

        if (res.error) {
          if (!autoSave) {
            errorMessenger.showError(res.error);
            deferred.reject();
          }
        } else {
          vm.hasChanges = false;
          survey.id = res.data.id;
          vm.survey.id = res.data.id;
          if (publish) {
            confirmSurvey(survey, skipMessage);
          } else if (!autoSave) {
            if (!vm.surveySettings.disableMessages) {
              messenger.ok(res.message);
            }
            onSaved();
          }
          deferred.resolve();
        }
      });
      return deferred.promise;
    };

    function finishEdit(survey, autoSave, publish, skipMessage) {
      var deferred = $q.defer();
      vm.submitingForm = true;
      return surveyServices.updateSurvey(survey).then(function(res) {
        dbg.log2('#SurveyController > finishEdit > res ', res);
        vm.submitingForm = false;
        if (res.error) {
          if (!autoSave) {
            messenger.error(res.error);
            deferred.reject();
          }
        } else {
          vm.hasChanges = false;
          if (publish) {
            return confirmSurvey(survey, skipMessage);
          } else if (!autoSave) {
            if (!vm.surveySettings.disableMessages) {
              messenger.ok(res.message);
            }
            onSaved();
          }
          deferred.resolve();
        }
      });
      return deferred.promise;
    };

    function confirmSurvey(survey, skipMessage) {
      return surveyServices.confirmSurvey({ id: survey.id }).then(function(res) {
        dbg.log2('#SurveyController > confirmSurvey > res ', res);

        if (res.error) {
          errorMessenger.showError(res.error);
        } else {
          survey.confirmedAt = res.data.confirmedAt;
          if(!skipMessage) messenger.ok(res.message);
          onSaved();
          quitEditor();
        }
      });
    };


    function changeQuestions(question, order) {
      question.active = !question.active;

      if (question.active) {
        question.order = order;
        vm.survey.SurveyQuestions[order] = question;
      } else {
        delete vm.survey.SurveyQuestions[order];
      }

      autoSaveChanges(true);
    };

    function initQuestion(object, sq) {
      var question = sq || {};
      question.minAnswers = object.minAnswers;
      question.maxAnswers = object.maxAnswers;
      question.contactDetails = object.contactDetails;
      if (object.link) {
        question.link = object.link;
        if(question.answers && question.answers.length > 0) {
          question.answers[0].link = object.link;
        }
      }
      if (object.handleTag) {
        question.handleTag = object.handleTag;
      }

      if(object.hardcodedName) {
        question.name = object.name;
      }

      return question;
    };

    function initAnswers(object, question) {
      if(question.required) {
        question.active = true;
      }

      if(question.answers) {
        if(!question.isDefault) {
          question.active =  true;
        }
        return question.answers;
      }
      else {
        return defaultArray(object.minAnswers);
      }
    };

    function defaultArray(size) {
      return Array.apply(null, Array(size)).map(function(cv, index) { return { order: index } });
    };

    function initContacts(question) {
      question.type = "input"
      if(!vm.currentContacts) {
        if (!question.answers.length) {
          question.answers.push({});
        }
        var answer = question.answers[0];
        if(!answer.contactDetails) {
          seedContactDetails(answer);
        }
        if (question.handleTag) {
          answer.handleTag = question.handleTag;
        }

        vm.currentContacts = {};
        for(var i in answer.contactDetails) {
          var contact = answer.contactDetails[i];
          vm.currentContacts[contact.model] = contact.name;
        }
      }
    };

    function galleryDropdownData(type, dependency) {
      return {
        validation: 'uploadToGallery',
        types: vm.uploadTypes[type],
        modal: { upload: true, select: true, set: type },
        dependency: dependency
      };
    }

    function initGallery(gc) {
      vm.uploadTypes = {
        survey: [gc.getUploadType('brandLogo')],
        questions: [gc.getUploadType('video'), gc.getUploadType('audio'), gc.getUploadType('videoService')]
      }

      gc.preloadResources({ type: ['image', 'video', 'audio', 'link'], scope: ['brandLogo', 'collage', 'videoService'], stock: true });
    }

    function seedContactDetails(answer) {
      answer.contactDetails = {};
      for(var i in vm.contactDetails) {
        var contact = vm.contactDetails[i];
        if(!contact.disabled) {
          answer.contactDetails[contact.model] = contact;
        }
      }
    };

    function isSessionOpen() {
      if (vm.survey) {
        if (vm.survey.confirmedAt) {
          return !vm.survey.closed;
        }
      } else {
        return false;
      }
    }

    function canChangeAnswers(value, question) {
      if (isSessionOpen()) {
        return false;
      } else {
        if(value == 'add') {
          return (question.answers.length < question.maxAnswers);
        }
        else {
          return (question.answers.length > question.minAnswers);
        }
      }
    };

    function changeAnswers(value, question, index) {
      if (isSessionOpen()) {
        return false;
      } else {
        if (value == 'add') {
          question.answers.push({ order: question.answers.length });
        } else {
          question.answers.splice(index, 1);
          autoSaveChanges(true);
        }
      }
    };

    function defaultQuestionParams(question) {
      return {
        name: question.name,
        question: question.question,
        answers: question.answers,
        order: question.order,
        audioVideo: question.audioVideo,
        required: question.required,
        isDefault: true
      };
    }

    function defaultSurveyData() {
      var array = [];
      for(var i in vm.defaultQuestions) {
        var params = defaultQuestionParams(vm.defaultQuestions[i]);
        array.push(params);
      }

      return {
        description: vm.defaultIntroduction,
        thanks: vm.defaultThanks,
        SurveyQuestions: array
      };
    }

    function moveBrowserTo(element, timeoutForAnimation) {
      $timeout(function () {
        element.scrollIntoView();
      }, timeoutForAnimation);
    }

    function addContactDetail(cd, answer) {
      cd.disabled = vm.currentContacts[cd.model] ? true : false;
      if(!cd.disabled) {
        vm.currentContacts[cd.model] = cd.name;
        answer.contactDetails[cd.model] = cd;
      }
      else {
        delete vm.currentContacts[cd.model];
        delete answer.contactDetails[cd.model];
      }
      autoSaveChanges(true);
    };

    function contactDetailDisabled(cd) {
      return (vm.currentContacts[cd.model] ? false : cd.disabled != false);
    };

    function sectionQuestions(section) {
      return vm.defaultQuestions.slice(section.interval[0], section.interval[1]);
    }

    function questionTemplate(question) {
      if (question.expandable) {
        return "/js/ngApp/components/dashboard-resources-contactLists-survey/templates/question-sections/expandable-section.html";
      } else {
        return "/js/ngApp/components/dashboard-resources-contactLists-survey/templates/question-sections/plain-section.html";
      }
    }

    function stopAutosave() {
      if (angular.isDefined(vm.autoSave)) {
        $interval.cancel(vm.autoSave);
        vm.autoSave = undefined;
      }
    }

    $scope.$on("$destroy", function() {
      stopAutosave();
    });
  };
})();
