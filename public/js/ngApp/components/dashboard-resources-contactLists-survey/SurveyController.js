(function () {
  'use strict';

  angular.module('KliikoApp').controller('SurveyListController', SurveyController);
  SurveyController.$inject = ['dbg', 'surveyServices', 'angularConfirm', 'messenger', '$timeout', '$interval', '$anchorScroll', '$location', '$window', 'errorMessenger', 'domServices'];

  function SurveyController(dbg, surveyServices, angularConfirm, messenger, $timeout, $interval, $anchorScroll, $location, $window, errorMessenger, domServices) {
    dbg.log2('#SurveyController started');

    var vm = this;
    vm.surveys = {};
    vm.uploadTypes = {};
    vm.autoSave = null;
    vm.stats = {};
    vm.currentSurveyId = null;

    vm.defaultIntroduction = "(Brand/Organisation) would like your fast feedback on (issue). It will only take 2 minutes, and you'll be in the draw for (prize). Thanks for your help!";
    vm.defaultThanks = "Thanks for all your feedback and help with our survey! We'll announce the lucky winner of the draw for (prize) on (Facebook/website) on (date).";

    vm.popOverMessages = {
      create: 'Create',
      remove: 'Delete',
      edit: 'Edit',
      copy: 'Copy',
      export: 'Export',
      report: 'Stats'
    };

    vm.userTemplates = {
      "intro": "/js/ngApp/components/dashboard-resources-contactLists-survey/recruiter/recruiter-intro.html",
      "0": "/js/ngApp/components/dashboard-resources-contactLists-survey/recruiter/advanced-recruiter-header.html",
      "1": "/js/ngApp/components/dashboard-resources-contactLists-survey/recruiter/empty-header.html"
    }
    //Pass these to SurveyEditController
    vm.surveySettings = {
      type: 'recruiter',
      onFinished: vm.showStartPage,
      userTemplates: vm.userTemplates
    }


    // Uses services
    vm.removeSurvey = removeSurvey;
    vm.changeStatus = changeStatus;
    vm.copySurvey = copySurvey;
    vm.exportSurvey = exportSurvey;
    vm.showStats = showStats;
    vm.exportStatsUrl = exportStatsUrl;

    // Helpers
    vm.checkTag = surveyServices.checkTag;
    vm.canDelete = canDelete;

    function init() {
      surveyServices.getAllSurveys({type: vm.surveySettings.type}).then(function(res) {
        vm.surveys = res.data;
        vm.dateFormat = res.dateFormat;
        vm.currentSurveyId = null;
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
          vm.stats = res.data;
          domServices.modal('statsModal');
        }
      });
    };

    function exportStatsUrl(surveyId, type) {
      return surveyServices.exportSurveyStatsUrl(surveyId, type);
    };

    function changeStatus(survey) {
      surveyServices.changeStatus({ id: survey.id, closed: !survey.switchValue}).then(function(res) {
        dbg.log2('#SurveyController > changeStatus > res ', res);

        if(res.error) {
          errorMessenger.showError(res.error);
        } else {
          survey.closed = res.data.closed;
          survey.closedAt = res.data.closedAt;
          messenger.ok(res.message);
        }
        survey.switchValue = !survey.closed;
      });
    };

    function canDelete(survey) {
      var date = new Date();
      date.setDate(date.getDate() - 1);
      return survey.closed && (new Date(survey.closedAt) <= date) || !survey.confirmedAt;
    }

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

    function exportSurvey(surveyId) {
      surveyServices.canExportSurveyData().then(function(res) {
        if(res.error) {
          messenger.error(res.error);
        }else{
          $window.location.href = '/resources/survey/export/' + surveyId;
        }
      });
    };

    vm.showStartPage = function() {
      vm.currentPage = { page: 'index' };
      init();
    };

    vm.showCreatePage = function() {
      vm.currentSurveyMode = vm.popOverMessages.create;
      vm.currentPage = { page: 'manage' };
    }

    vm.editSurvey = function(survey) {
      vm.currentSurveyMode = vm.popOverMessages.edit;
      vm.currentSurveyId = survey.id;
      vm.currentPage = { page: 'manage' };
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

    vm.showStartPage();
  };
})();
