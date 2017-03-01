(function () {
  'use strict';

  angular.module('KliikoApp').controller('SurveyEditController', SurveyController);
  SurveyController.$inject = ['dbg', 'surveyServices', 'angularConfirm', 'messenger', '$timeout', '$interval', '$anchorScroll', '$location', '$window', 'errorMessenger', 'domServices'];

  function SurveyController(dbg, surveyServices, angularConfirm, messenger, $timeout, $interval, $anchorScroll, $location, $window, errorMessenger, domServices) {
    dbg.log2('#SurveyController started');

    var vm = this;
    vm.surveys = {};
    vm.uploadTypes = {};
    vm.autoSave = null;
    vm.stats = {};

    vm.defaultIntroduction = "(Brand/Organisation) would like your fast feedback on (issue). It will only take 2 minutes, and you'll be in the draw for (prize). Thanks for your help!";
    vm.defaultThanks = "Thanks for all your feedback and help with our survey! We'll announce the lucky winner of the draw for (prize) on (Facebook/website) on (date).";

    vm.popOverMessages = {
      remove: 'Delete',
      edit: 'Edit',
      copy: 'Copy',
      export: 'Export',
      report: 'Stats'
    };

    // Uses services
    vm.saveSurvey = saveSurvey;
    // Inits
    vm.init = init;
    vm.initQuestion = initQuestion;
    vm.initAnswers = initAnswers;
    vm.initContacts = initContacts;
    vm.initGallery = initGallery;
    vm.initAutoSave = initAutoSave;

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

    vm.customSurveyTemplate = function(object) {
      let template = vm.userTemplates[object.tag];
      return template ? template : "/js/ngApp/components/dashboard-resources-contactLists-survey/recruiter/empty-header.html";
    }

    vm.userTemplates = {
      "0": "/js/ngApp/components/dashboard-resources-contactLists-survey/recruiter/advanced-recruiter-header.html",
      "1": "/js/ngApp/components/dashboard-resources-contactLists-survey/recruiter/empty-header.html"
    }

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
      surveyServices.getConstants().then(function(res) {
        vm.defaultQuestions = res.data.defaultQuestions;
        vm.contactDetails = res.data.contactDetails;
        vm.constantErrors = res.data.validationErrors;
        vm.validationErrors = vm.constantErrors.field;
        vm.minsMaxs = res.data.minsMaxs;
        vm.minQuestions = res.data.minQuestions;
        vm.tableOfContents = res.data.tableOfContents;
      });
    };

    function init(surveyId, delegateMethods) {
      vm.delegateMethods = delegateMethods;
      initConstants();
      surveyServices.findSurvey( {id: surveyId, skipValidations: true} ).then(function(res) {
        console.log("====", res.data);
        startSurveyEdit(res.data);
      });
    };

    function processSurveyData(survey) {
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
      }
    }

    function startSurveyEdit(survey) {
      processSurveyData(survey);
      vm.submitedForm = false;
      vm.submitError = null;
      vm.currentContacts = null;
      vm.survey = survey || defaultSurveyData();
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

    function initAutoSave() {
      vm.autoSave = $interval(function() {
        saveSurvey(true, false);
      }, 60000, 0, false);
    }

    function saveSurvey(autoSave, publish) {
      vm.submitedForm = true;
      vm.submitingForm = true;

      $timeout(function() {
        if(vm.manageForm.$valid) {
          var selected = findSelected();
          if(publish && selected.length < vm.minQuestions) {
            vm.submitError = vm.constantErrors.minQuestions + vm.minQuestions;
          } else {
            delete vm.submitError;
            var object = JSON.parse(JSON.stringify(vm.survey));
            object.SurveyQuestions = selected;
            if (!object.id) {
              finishCreate(object, autoSave, publish);
            } else {
              finishEdit(object, autoSave, publish);
            }
          }
        } else if (!autoSave) {
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
    }

    function finishCreate(survey, autoSave, publish) {
      surveyServices.createSurvey(survey).then(function(res) {
        dbg.log2('#SurveyController > finishCreate > res ', res);

        if (res.error) {
          if (!autoSave) {
            errorMessenger.showError(res.error);
          }
        } else {
          survey.id = res.data.id;
          vm.survey.id = res.data.id;
          if (publish) {
            confirmSurvey(survey);
          } else if (!autoSave) {
            messenger.ok(res.message);
            //changePage('index');
          }
        }
      });
    };

    function finishEdit(survey, autoSave, publish) {
      surveyServices.updateSurvey(survey).then(function(res) {
        dbg.log2('#SurveyController > finishEdit > res ', res);

        if (res.error) {
          if (!autoSave) {
            messenger.error(res.error);
          }
        } else {
          if (publish) {
            confirmSurvey(survey);
          } else if (!autoSave) {
            messenger.ok(res.message);
            //changePage('index');
          }
        }
      });
    };

    function confirmSurvey(survey) {
      surveyServices.confirmSurvey({ id: survey.id }).then(function(res) {
        dbg.log2('#SurveyController > confirmSurvey > res ', res);

        if (res.error) {
          errorMessenger.showError(res.error);
        } else {
          survey.confirmedAt = res.data.confirmedAt;
          messenger.ok(res.message);
          //changePage('index');
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
        question.answers.push({});
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
  };
})();
