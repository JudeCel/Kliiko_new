(function () {
  'use strict';

  angular.module('KliikoApp').controller('SurveyController', SurveyController);
  SurveyController.$inject = ['dbg', 'surveyServices', 'angularConfirm', 'messenger', '$timeout', 'ngProgressFactory'];

  function SurveyController(dbg, surveyServices, angularConfirm, messenger, $timeout, ngProgressFactory) {
    dbg.log2('#SurveyController started');

    var vm = this;
    vm.surveys = {};

    // Uses services
    vm.removeSurvey = removeSurvey;
    vm.changeStatus = changeStatus;
    vm.copySurvey = copySurvey;
    vm.finishManage = finishManage;
    vm.confirmSurvey = confirmSurvey;

    // Inits
    vm.initQuestion = initQuestion;
    vm.initAnswers = initAnswers;
    vm.initContacts = initContacts;

    // Helpers
    vm.statusIcon = statusIcon;
    vm.canChangeAnswers = canChangeAnswers;
    vm.changeAnswers = changeAnswers;
    vm.defaultArray = defaultArray;
    vm.changePage = changePage;
    vm.addContactDetail = addContactDetail;
    vm.pickValidClass = surveyServices.pickValidClass;
    vm.changeQuestions = changeQuestions;
    vm.contactDetailDisabled = contactDetailDisabled;

    vm.answerSortOptions = {
      handle: '.list-handle',
      onUpdate: function(evt) {
        evt.models.forEach(function(val, index, array) {
          val.order = index;
        });
      }
    }

    initConstants();
    changePage('index');

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
      var progressbar = ngProgressFactory.createInstance();
      progressbar.start();

      surveyServices.getAllSurveys().then(function(res) {
        progressbar.complete();
        vm.surveys = res.data;
        vm.dateFormat = res.dateFormat;
        dbg.log2('#SurveyController > getAllSurveys > res ', res.data);
      });
    };

    function removeSurvey(survey) {
      angularConfirm('Are you sure you want to remove Survey?').then(function(response) {
        var progressbar = ngProgressFactory.createInstance();
        progressbar.start();

        surveyServices.removeSurvey({ id: survey.id }).then(function(res) {
          dbg.log2('#SurveyController > removeSurvey > res ', res);
          progressbar.complete();

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
      var progressbar = ngProgressFactory.createInstance();
      progressbar.start();

      surveyServices.changeStatus({ id: survey.id, closed: !survey.closed }).then(function(res) {
        dbg.log2('#SurveyController > changeStatus > res ', res);
        progressbar.complete();

        if(res.error) {
          messenger.error(surveyServices.prepareError(res.error));
        }
        else {
          survey.closed = !survey.closed;
          messenger.ok(res.message);
        }
      });
    };

    function finishManage() {
      vm.submitedForm = true;
      vm.submitingForm = true;
      var progressbar = ngProgressFactory.createInstance();
      progressbar.start();

      $timeout(function() {
        if(vm.manageForm.$valid) {
          if(Object.keys(vm.survey.SurveyQuestions).length < vm.minQuestions) {
            vm.submitError = vm.constantErrors.minQuestions + vm.minQuestions;
          }
          else {
            delete vm.submitError;
            if(vm.currentPage.type == 'create') {
              finishCreate();
            }
            else {
              vm.survey.id = vm.survey.id;
              finishEdit();
            }
          }
        }
        else {
          vm.submitError = vm.constantErrors.default;
        }

        progressbar.complete();
        vm.submitingForm = false;
      }, 1000);
    };

    function finishCreate() {
      surveyServices.createSurvey(vm.survey).then(function(res) {
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

    function finishEdit() {
      surveyServices.updateSurvey(vm.survey).then(function(res) {
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
      var progressbar = ngProgressFactory.createInstance();
      progressbar.start();

      surveyServices.copySurvey({ id: survey.id }).then(function(res) {
        dbg.log2('#SurveyController > copySurvey > res ', res);
        progressbar.complete();

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
      var progressbar = ngProgressFactory.createInstance();
      progressbar.start();

      var date = new Date();
      surveyServices.confirmSurvey({ id: survey.id, confirmedAt: date }).then(function(res) {
        dbg.log2('#SurveyController > confirmSurvey > res ', res);
        progressbar.complete();

        if(res.error) {
          messenger.error(surveyServices.prepareError(res.error));
        }
        else {
          survey.confirmedAt = date;
          messenger.ok(res.message);
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
      if(survey.closed) {
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
      if(question.answers) {
        question.active =  true;
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
      if(value == 'add') {
        return (question.answers.length < question.maxAnswers);
      }
      else {
        return (question.answers.length > question.minAnswers);
      }
    };

    function changeAnswers(value, question, index) {
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
          survey.SurveyQuestions = object;
        }

        vm.submitError = null;
        vm.currentContacts = null;
        vm.survey = survey || { SurveyQuestions: {} };
        vm.currentPage = { page: 'manage', type: page };
      }
    };

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
