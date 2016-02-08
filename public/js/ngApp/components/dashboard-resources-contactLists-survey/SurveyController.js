(function () {
  'use strict';

  angular.module('KliikoApp').controller('SurveyController', SurveyController);
  SurveyController.$inject = ['dbg', 'surveyServices', 'angularConfirm', 'messenger', '$timeout', 'domServices',
    'GalleryServices', '$sce', '$anchorScroll', '$location', '$window', 'ngDraggable'];

  function SurveyController(dbg, surveyServices, angularConfirm, messenger, $timeout, domServices, GalleryServices, $sce, $anchorScroll,
    $location, $window, ngDraggable) {
    dbg.log2('#SurveyController started');

    var vm = this;
    vm.surveys = {};
    vm.brandLogos = {};
    vm.questionResource = {};
    vm.question = {showUpload: true};
    vm.disableUpload = false;
    vm.surveySelecctOptions = {
      show: true,
      uploaded: false
    };

    // Resource files
    vm.title = "";
    vm.file = {};
    vm.youtubeUrl = "";
    vm.introductionFile = {};
    vm.likeDislike = {};
    vm.importance = {};
    vm.surveyBrandLogo = {};
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
    vm.onDropComplete = onDropComplete;

    vm.openBrandLogosModal = openBrandLogosModal;
    vm.openQuestionModal = openQuestionModal;
    vm.selectBrandLogo = selectBrandLogo;
    vm.removeResource = removeResource;
    vm.saveResource = saveResource;
    vm.renderHtml = renderHtml;
    vm.getResourceNameUrl = getResourceNameUrl;
    vm.getResourceThumbUrl = getResourceThumbUrl;

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

    function openBrandLogosModal(){
      brandLogosFromGallery();
      domServices.modal('getGallery');
    }

    function openQuestionModal(type, question) {
      vm.questionResource.type = type;
      vm.question = question;
      domServices.modal('questionModal');
    }

    function selectBrandLogo(resource){
      vm.surveySelecctOptions.show = false;
      vm.survey.resourceId = resource.id;
      vm.survey.Resource = resource;
    }

    function removeResource(id, question, survey){
      GalleryServices.deleteResources({resource_id: id}).then(function(res) {
        if(res.error){
          messenger.error(res.error);
        }else{
          if(survey !== null){
            vm.surveySelecctOptions.show = true;
            vm.surveySelecctOptions.uploaded = false;
            survey.Resource = null;
            survey.resourceId = null;
          }
          if(question !== null){
            question.Resource = null;
            question.resourceId = null;
          }
          clearform();
        }
      });
    }

    function brandLogosFromGallery(){
      GalleryServices.getResources({type: "brandLogo"}).then(function(res) {
        vm.brandLogos = res.data;
      });
    }

    function saveResource(resourceType){
      vm.disableUpload = true;

      if(resourceType == "youtube"){
        saveYoutubeUrl(resourceType);
      }else{
        uploadFile(resourceType);
      }
    }

    function clearform(){
      vm.title = "";
      vm.file = {};
      vm.youtubeUrl = "";
      domServices.modal('questionModal', 'close');
    }

    function uploadFile(resourceType) {
      var resourceParams = {
        title: vm.title,
        type: resourceType,
        text: vm.file.name,
        file: vm.file
      };


      GalleryServices.createResource(resourceParams).then(function(res) {
        if(res.error){
          messenger.error(res.error);
        }else{

          if(resourceType == "brandLogo"){
            vm.surveySelecctOptions.show = false;
            vm.surveySelecctOptions.uploaded = true;

          }else{
            vm.question.Resource = {};
          }

          GalleryServices.postuploadData(resourceParams).then(function(res) {
            if(res.error){
              messenger.error(res.error);
            }else{

              if(resourceType == "brandLogo"){
                vm.survey.resourceId = res.data.id;
                vm.survey.Resource = res.data;
              }else{
                vm.question.resourceId = res.data.id;
                vm.question.Resource = res.data;
              }

              clearform();
              vm.disableUpload = false;
            }
          })
        }
      })

    }

    function saveYoutubeUrl() {
      vm.question.resourceId = null;
      vm.question.Resource = null;

      var resourceParams = {
        title: vm.title,
        text: vm.youtubeUrl
      };

      GalleryServices.saveYoutubeUrl(resourceParams).then(function(res) {
        if(res.error){
          messenger.error(res.error);
        }else{
          clearform();
          vm.question.Resource = res;
          vm.question.resourceId = res.id;
        }
      })
    }

    function getResourceNameUrl(resource){
      return "/chat_room/uploads/" + resource.JSON.name;
    }

    function getResourceThumbUrl(resource){
      return "/chat_room/uploads/" + resource.JSON.panelThumb;
    }

    function renderHtml(resource) {
      return $sce.trustAsHtml(resource.JSON.message);
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

    function finishManage() {
      vm.submitedForm = true;
      vm.submitingForm = true;

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
          $timeout(function() {
            var form = angular.element('#manageForm');
            var elem = form.find('.ng-invalid:first');
            var panel = elem.parents('.panel:first');

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
      $window.location.href = '/resources/survey/export/' + surveyId;
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
          survey.SurveyQuestions = object;
        }

        vm.submitError = null;
        vm.currentContacts = null;
        vm.survey = survey || { SurveyQuestions: {} };
        vm.currentPage = { page: 'manage', type: page };
        moveBrowserTo('');
      }
    };

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
