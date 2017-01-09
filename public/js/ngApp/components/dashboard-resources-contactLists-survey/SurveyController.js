(function () {
  'use strict';

  angular.module('KliikoApp').controller('SurveyController', SurveyController);
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
    vm.removeSurvey = removeSurvey;
    vm.changeStatus = changeStatus;
    vm.copySurvey = copySurvey;
    vm.saveSurvey = saveSurvey;
    vm.exportSurvey = exportSurvey;
    vm.showStats = showStats;

    // Inits
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
    vm.changePage = changePage;
    vm.addContactDetail = addContactDetail;
    vm.pickValidClass = surveyServices.pickValidClass;
    vm.changeQuestions = changeQuestions;
    vm.contactDetailDisabled = contactDetailDisabled;
    vm.onDropComplete = onDropComplete;
    vm.galleryDropdownData = galleryDropdownData;
    vm.checkTag = surveyServices.checkTag;
    vm.canDelete = canDelete;

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
      initConstants();
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
            messenger.error(res.error);
          }
          else {
            messenger.ok(res.message);
            var index = vm.surveys.indexOf(survey);
            vm.surveys.splice(index, 1);
          }
        });
      });
    };

    function showStats(survey) {
      surveyServices.getSurveyStats(survey.id).then(function(res) {
        if (res.error) {
          messenger.error(res.error);
        } else {
          vm.stats.name = survey.name;
          //todo:
          vm.stats.data = {};
          domServices.modal('statsModal');
        }
      });
    };

    function changeStatus(survey, val) {
      surveyServices.changeStatus({ id: survey.id, closed: !val}).then(function(res) {
        dbg.log2('#SurveyController > changeStatus > res ', res);

        if(res.error) {
          errorMessenger.showError(res.error);
        } else {
          survey.closed = res.data.closed;
          survey.closedAt = res.data.closedAt;
          messenger.ok(res.message);
        }
        val = !survey.closed;
      });
    };

    function canDelete(survey) {
      var date = new Date();
      date.setDate(date.getDate() - 1);
      return survey.closed && (new Date(survey.closedAt) <= date) || !survey.confirmedAt;
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
            changePage('index');
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
            changePage('index');
          }
        }
      });
    };

    function copySurvey(survey) {
      surveyServices.copySurvey({ id: survey.id }).then(function(res) {
        dbg.log2('#SurveyController > copySurvey > res ', res);

        if(res.error) {
          errorMessenger.showError(res.error);
        }
        else {
          vm.surveys.push(res.data);
          messenger.ok(res.message);
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
          changePage('index');
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

    function defaultArray(size) {
      return Array.apply(null, Array(size)).map(function(cv, index) { return { order: index } });
    };

    function changePage(page, survey) {
      vm.submitedForm = false;
      if (vm.autoSave) {
        $interval.cancel(vm.autoSave);
        vm.autoSave = null;
      }
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
          return showCreatePage(page);
        }

        submitPageData(page, survey);
      }
    };

    function showCreatePage(page) {
      vm.currentSurveyMode = 'Create';
      submitPageData(page);
    }

    function submitPageData(page, survey) {
      vm.submitError = null;
      vm.currentContacts = null;
      vm.survey = survey || defaultSurveyData();
      vm.currentPage = { page: 'manage', type: page };
      moveBrowserTo('');
    }

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
