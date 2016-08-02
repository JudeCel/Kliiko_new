(function () {
  'use strict';

  angular.module('KliikoApp').controller('SurveyController', SurveyController);
  SurveyController.$inject = ['dbg', 'surveyServices', 'angularConfirm', 'messenger', '$timeout', '$anchorScroll', '$location', '$window'];

  function SurveyController(dbg, surveyServices, angularConfirm, messenger, $timeout, $anchorScroll, $location, $window) {
    dbg.log2('#SurveyController started');

    var vm = this;
    vm.surveys = {};
    vm.uploadTypes = {};

    vm.defaultIntroduction = "(Brand/Organisation) would like your fast feedback on (issue). It will only take 2 minutes, and you'll be in the draw for (prize). Thanks for your help!";
    vm.defaultThanks = "Thanks for all your feedback and help with our survey! We'll announce the lucky winner of the draw for (prize) on (Facebook/website) on (date).";

    vm.popOverMessages = {
      remove: 'Remove survey',
      edit: 'Edit survey',
      copy: 'Copy survey',
      status: 'Change status',
      confirm: 'Confirm survey',
      export: 'Export survey'
    };

    // Uses services
    vm.removeSurvey = removeSurvey;
    vm.changeStatus = changeStatus;
    vm.copySurvey = copySurvey;
    vm.finishManage = finishManage;
    vm.confirmSurvey = confirmSurvey;
    vm.exportSurvey = exportSurvey;

    // Inits
    vm.initQuestion = initQuestion;
    vm.initAnswers = initAnswers;
    vm.initContacts = initContacts;
    vm.initGallery = initGallery;

    // Helpers
    vm.showPreview = showPreview;
    vm.replaceErrorMessage = replaceErrorMessage;
    vm.statusIcon = statusIcon;
    vm.canChangeAnswers = canChangeAnswers;
    vm.changeAnswers = changeAnswers;
    vm.defaultArray = defaultArray;
    vm.changePage = changePage;
    vm.addContactDetail = addContactDetail;
    vm.pickValidClass = surveyServices.pickValidClass;
    vm.changeQuestions = changeQuestions;
    vm.contactDetailDisabled = contactDetailDisabled;
    vm.onDropComplete = onDropComplete;
    vm.galleryDropdownData = galleryDropdownData;

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

    initConstants();
    changePage('index');

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
      surveyServices.getConstants().then(function(res) {
        vm.defaultQuestions = res.data.defaultQuestions;
        vm.contactDetails = res.data.contactDetails;
        vm.constantErrors = res.data.validationErrors;
        vm.validationErrors = vm.constantErrors.field;
        vm.minsMaxs = res.data.minsMaxs;
        vm.minQuestions = res.data.minQuestions;
      });
    };

    function init() {
      surveyServices.getAllSurveys().then(function(res) {
        vm.surveys = res.data;
        vm.dateFormat = res.dateFormat;
        dbg.log2('#SurveyController > getAllSurveys > res ', res.data);
      });
    };

    function removeSurvey(survey) {
      angularConfirm('Are you sure you want to remove Survey?').then(function(response) {
        surveyServices.removeSurvey({ id: survey.id }).then(function(res) {
          dbg.log2('#SurveyController > removeSurvey > res ', res);

          if(res.error) {
            messenger.error(surveyServices.prepareError(res.error));
          }
          else {
            messenger.ok(res.message);
            var index = vm.surveys.indexOf(survey);
            vm.surveys.splice(index, 1);
          }
        });
      });
    };

    function changeStatus(survey) {
      surveyServices.changeStatus({ id: survey.id, closed: !survey.closed }).then(function(res) {
        dbg.log2('#SurveyController > changeStatus > res ', res);

        if(res.error) {
          messenger.error(surveyServices.prepareError(res.error));
        }
        else {
          survey.closed = !survey.closed;
          messenger.ok(res.message);
        }
      });
    };

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

    function finishManage() {
      vm.submitedForm = true;
      vm.submitingForm = true;

      $timeout(function() {
        if(vm.manageForm.$valid) {
          var selected = findSelected();
          if(selected.length < vm.minQuestions) {
            vm.submitError = vm.constantErrors.minQuestions + vm.minQuestions;
          }
          else {
            delete vm.submitError;
            var object = JSON.parse(JSON.stringify(vm.survey));
            object.SurveyQuestions = selected;
            if(vm.currentPage.type == 'create') {
              finishCreate(object);
            }
            else {
              finishEdit(object);
            }
          }
        }
        else {
          vm.submitError = vm.constantErrors.default;
          $timeout(function() {
            var form = angular.element('#manageForm');
            var elem = form.find('.ng-invalid:first');
            var panel = elem.children('.panel:first');
            if(panel.length == 0) {
              panel = elem.parents('.panel:first');
            }

            var panelParent = panel.scope().$parent;
            if(panelParent.hasOwnProperty('accordion')) {
              panelParent.object.open = true;
            }
            moveBrowserTo(panel[0].id);
          });
        }

        vm.submitingForm = false;
      }, 1000);
    };

    function finishCreate(survey) {
      surveyServices.createSurvey(survey).then(function(res) {
        dbg.log2('#SurveyController > finishCreate > res ', res);

        if(res.error) {
          messenger.error(surveyServices.prepareError(res.error));
        }
        else {
          changePage('index');
          messenger.ok(res.message);
        }
      });
    };

    function finishEdit(survey) {
      surveyServices.updateSurvey(survey).then(function(res) {
        dbg.log2('#SurveyController > finishEdit > res ', res);

        if(res.error) {
          messenger.error(surveyServices.prepareError(res.error));
        }
        else {
          changePage('index');
          messenger.ok(res.message);
        }
      });
    };

    function copySurvey(survey) {
      surveyServices.copySurvey({ id: survey.id }).then(function(res) {
        dbg.log2('#SurveyController > copySurvey > res ', res);

        if(res.error) {
          messenger.error(surveyServices.prepareError(res.error));
        }
        else {
          vm.surveys.push(res.data);
          messenger.ok(res.message);
        }
      });
    };

    function confirmSurvey(survey) {
      var date = new Date();
      surveyServices.confirmSurvey({ id: survey.id, confirmedAt: date }).then(function(res) {
        dbg.log2('#SurveyController > confirmSurvey > res ', res);

        if(res.error) {
          messenger.error(surveyServices.prepareError(res.error));
        }
        else {
          survey.confirmedAt = date;
          messenger.ok(res.message);
        }
      });
    };

    function exportSurvey(surveyId) {
      surveyServices.canExportSurveyData().then(function(res) {
        if(res.error) {
          messenger.error(res.error);
        }else{
          $window.location.href = '/resources/survey/export/' + surveyId;
        }
      });
    };

    function changeQuestions(question, order) {
      question.active = !question.active;

      if(question.active) {
        question.order = order;
        vm.survey.SurveyQuestions[order] = question;
      }
      else {
        delete vm.survey.SurveyQuestions[order];
      }
    };

    function statusIcon(survey) {
      if(survey && survey.closed) {
        return '/icons/password_red.png';
      }
      else {
        return '/icons/password_grey.png';
      }
    };

    function initQuestion(object, sq) {
      var question = sq || {};
      question.minAnswers = object.minAnswers;
      question.maxAnswers = object.maxAnswers;
      question.contactDetails = object.contactDetails;

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

    function initContacts(answer) {
      if(!vm.currentContacts) {
        if(!answer.contactDetails) {
          seedContactDetails(answer);
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
        types: vm.uploadTypes[type],
        modal: { upload: true, select: true, set: type },
        dependency: dependency
      };
    }

    function initGallery(gc) {
      vm.uploadTypes = {
        survey: [gc.getUploadType('brandLogo')],
        questions: [gc.getUploadType('video'), gc.getUploadType('audio'), gc.getUploadType('youtube')]
      }

      gc.listResources({ type: ['image', 'video', 'audio', 'link'], scope: ['brandLogo', 'collage', 'youtube'] }).then(function(result) {
        gc.resourceList = result.resources;
        for(var i in result.resources) {
          var resource = result.resources[i];
          var type = gc.getUploadTypeFromResource(resource);
          gc.selectionList[type].push(resource);
        }
      });
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

    function canChangeAnswers(value, question) {
      if(vm.survey.confirmedAt)
        return false;

      if(value == 'add') {
        return (question.answers.length < question.maxAnswers);
      }
      else {
        return (question.answers.length > question.minAnswers);
      }
    };

    function changeAnswers(value, question, index) {
      if(vm.survey.confirmedAt)
        return false;

      if(value == 'add') {
        question.answers.push({ order: question.answers.length });
      }
      else {
        question.answers.splice(index, 1);
      }
    };

    function defaultArray(size) {
      return Array.apply(null, Array(size)).map(function(cv, index) { return { order: index } });
    };

    function changePage(page, survey) {
      vm.submitedForm = false;
      if(page == 'index') {
        init();
        vm.currentPage = { page: page };
      }
      else {
        if(survey && survey.SurveyQuestions instanceof Array) {
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
          vm.currentSurveyMode = 'Edit';
        }
        else {
          vm.currentSurveyMode = 'Create';
        }

        vm.submitError = null;
        vm.currentContacts = null;
        vm.survey = survey || defaultSurveyData();
        vm.currentPage = { page: 'manage', type: page };
        moveBrowserTo('');
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

    function moveBrowserTo(elementId) {
      $timeout(function () {
        $location.hash(elementId);
        $anchorScroll();
      });
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
    };

    function contactDetailDisabled(cd) {
      return (vm.currentContacts[cd.model] ? false : cd.disabled);
    };
  };
})();
