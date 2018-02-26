(function () {
  'use strict';

  angular.module('KliikoApp').filter('toArray', filter);
  angular.module('KliikoApp.Root').filter('toArray', filter);

  function filter() {
    return function(obj) {
      var result = [];
      angular.forEach(obj, function(val, key) {
        result[val.order] = val;
      });
      return result;
    };
  }

  angular.module('KliikoApp.Root').controller('SurveyClientController', SurveyClientController);
  SurveyClientController.$inject = ['dbg', 'surveyServices', 'GalleryServices', 'messenger', '$timeout', 'messagesUtil'];

  function SurveyClientController(dbg, surveyServices, GalleryServices, messenger, $timeout, messagesUtil) {
    dbg.log2('#SurveyClientController started');

    var vm = this;
    vm.survey = { SurveyQuestions: {} };

    vm.pickValidClass = surveyServices.pickValidClass;
    vm.submitSurvey = submitSurvey;
    vm.init = init;
    vm.checkTag = surveyServices.checkTag;
    vm.defaultBaseQuestions = [];
    initConstants();

    function initConstants() {
      surveyServices.getConstants().then(function(res) {
        vm.unfilled = res.data.validationErrors.unfilled;
        vm.validationErrors = res.data.validationErrors.answer;
        vm.minsMaxs = res.data.minsMaxs;
        vm.defaultBaseQuestions = res.data.defaultQuestions;
      });
    };

    function mapHandleTags() {
      for(var i in vm.survey.SurveyQuestions) {
        var question = vm.survey.SurveyQuestions[i];

        for(var i in vm.defaultBaseQuestions) {
          var baseQuestion = vm.defaultBaseQuestions[i];
          if (question.name == baseQuestion.name) {
            question.handleTag = baseQuestion.handleTag;
          }
        }
      }
    }

    function init(surveyId, chatUrl, token, redirectSurveyLink) {
      vm.chatUrl = chatUrl;
      vm.token = token;
      if (redirectSurveyLink) {
        vm.redirectSurveyLink = redirectSurveyLink + "?token=" + vm.token;
      }
      surveyServices.findSurvey({ id: surveyId, token: token }).then(function(res) {
        dbg.log2('#SurveyClientController > findSurvey > res ', res);

        if(res.error) {
          vm.message = res.error;
        }
        else {
          vm.status = res.status;
          vm.survey = res.data;
          vm.isFacilitator = res.isFacilitator;
          mapHandleTags();
          $('#GalleryController').removeClass('hidden');

          GalleryServices.surveyResources(vm.survey.id).then(function(result) {
            mapSurveyResources(result.survey);
          }, function() {
            messenger.error(messagesUtil.gallery.cantLoad);
          });

          autoFillNameField();
        }
      });
    };

    function autoFillNameField () {
      $timeout(function() {
        $('#contact-firstName').val(vm.survey.username).trigger('input');
      });
    }

    function submitSurvey() {
      if(vm.isFacilitator) return messenger.error('Only Guests can answer these questions');

      vm.submitedSurvey = true;
      vm.submitingSurvey = true;

      $timeout(function() {
        if(vm.submitForm.$valid) {
          delete vm.surveySelect.error;
          vm.surveySelect.surveyId = vm.survey.id;

          surveyServices.answerSurvey(vm.surveySelect).then(function(res) {
            dbg.log2('#SurveyClientController > answerSurvey > res ', res);

            if(res.error) {
              messenger.error(res.error);
            }
            else {
              if (res.status == 307) {
                if (vm.redirectSurveyLink) {
                  window.location = vm.redirectSurveyLink;
                }
                vm.status = res.status;
              } else
                vm.status = res.status;
            }
          });
        }
        else {
          vm.surveySelect.error = vm.unfilled;
        }

        vm.submitingSurvey = false;
      }, 1000);
    };

    function mapSurveyResources(survey) {
      vm.survey.resource = survey.resource;
      for(var i in survey.SurveyQuestions) {
        var question = survey.SurveyQuestions[i];

        for(var j in vm.survey.SurveyQuestions) {
          var surveyQuestion = vm.survey.SurveyQuestions[j];

          if(surveyQuestion.id == question.id) {
            surveyQuestion.resource = question.resource;
          }
        }
      }
    }
  };
})();
