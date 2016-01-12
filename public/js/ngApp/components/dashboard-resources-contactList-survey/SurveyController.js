(function () {
  'use strict';

  angular.module('KliikoApp').controller('SurveyController', SurveyController);
  SurveyController.$inject = ['dbg', 'surveyServices', 'angularConfirm', 'messenger', '$scope'];

  function SurveyController(dbg, surveyServices, angularConfirm, messenger, $scope) {
    dbg.log2('#SurveyController started');

    var vm = this;
    vm.surveys = {};

    // Uses services
    vm.removeSurvey = removeSurvey;
    vm.changeStatus = changeStatus;
    vm.copySurvey = copySurvey;
    vm.finishManage = finishManage;

    // Inits
    vm.initQuestion = initQuestion;
    vm.initAnswers = initAnswers;

    // Helpers
    vm.statusIcon = statusIcon;
    vm.chooseValidIcon = chooseValidIcon;
    vm.validateQuestion = validateQuestion;
    vm.questionChange = questionChange;
    vm.canChangeAnswers = canChangeAnswers;
    vm.changeAnswers = changeAnswers;
    vm.defaultArray = defaultArray;
    vm.changePage = changePage;
    vm.addContactDetail = addContactDetail;

    vm.answerSortOptions = {
      onUpdate: function(evt) {
        evt.models.forEach(function(val, index, array) {
          val.order = index;
        });
      }
    }

    vm.contactDetails = [
      {
        name: 'First Name',
        input: true
      },
      {
        name: 'Last Name',
        input: true
      },
      {
        name: 'Gender',
        select: true,
        options: ['Male', 'Female']
      },
      {
        name: 'Email',
        input: true
      },
      {
        name: 'Mobile',
        input: true
      },
      {
        name: 'Landline',
        input: true,
        canDisable: true,
        disabled: true
      },
      {
        name: 'Postal address',
        input: true,
        canDisable: true,
        disabled: true
      },
      {
        name: 'City',
        input: true,
        canDisable: true,
        disabled: true
      },
      {
        name: 'State',
        input: true,
        canDisable: true,
        disabled: true
      },
      {
        name: 'Postcode',
        input: true,
        canDisable: true,
        disabled: true
      },
      {
        name: 'Country',
        input: true,
        canDisable: true,
        disabled: true
      },
      {
        name: 'Company Name',
        input: true,
        canDisable: true,
        disabled: true
      },
    ];

    vm.defaultQuestions = [
      {
        order: 0,
        name: 'First Choice',
        input: true,
        minAnswers: 2,
        maxAnswers: 5
      },
      {
        order: 1,
        name: 'Second Choice',
        input: true,
        minAnswers: 2,
        maxAnswers: 5
      },
      {
        order: 2,
        name: 'Advice',
        textArea: true,
        minAnswers: 1,
        maxAnswers: 1
      },
      {
        order: 3,
        name: 'Like-Dislike',
        input: true,
        audioVideo: true,
        minAnswers: 2,
        maxAnswers: 5
      },
      {
        order: 4,
        name: 'Importance',
        input: true,
        audioVideo: true,
        minAnswers: 2,
        maxAnswers: 5
      },
      {
        order: 5,
        name: 'Most Important',
        input: true,
        minAnswers: 2,
        maxAnswers: 5
      },
      {
        order: 6,
        name: 'Interest',
        hardcodedName: true,
        checkbox: true,
        minAnswers: 1,
        maxAnswers: 1
      },
      {
        order: 7,
        name: 'Prize Draw',
        hardcodedName: true,
        checkbox: true,
        minAnswers: 1,
        maxAnswers: 1
      },
      {
        order: 8,
        name: 'Contact details',
        hardcodedName: true,
        contact: true,
        minAnswers: 1,
        maxAnswers: 1
      },
      {
        order: 9,
        name: 'Thanks',
        hardcodedName: true,
        disableAnswers: true,
        textArea: true
      }
    ];

    changePage('index');

    function init() {
      surveyServices.getAllSurveys().then(function(res) {
        vm.surveys = res.data;
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
            messenger.ok(res.data);
            var index = vm.surveys.indexOf(survey);
            vm.surveys.splice(index, 1);
          }
        });
      });
    };

    function changeStatus(survey) {
      surveyServices.updateSurvey({ id: survey.id, closed: !survey.closed }).then(function(res) {
        dbg.log2('#SurveyController > changeStatus > res ', res);
        if(res.error) {
          messenger.error(res.error);
        }
        else {
          survey.closed = !survey.closed;
          messenger.ok("Survey has been successfully " + (survey.closed ? 'closed' : 'opened'));
        }
      });
    };

    function finishManage() {
      if(validateSurvey()) {
        if(vm.currentPage.type == 'create') {
          finishCreate();
        }
        else {
          vm.manage.survey.id = vm.manageTemp.survey.id;
          finishEdit();
        }
      }
      else {
        if(!vm.manageTemp.survey.errors.submitError) {
          vm.manageTemp.survey.errors.submitError = 'There were some errors';
        }
      }
    };

    function finishCreate() {
      surveyServices.createSurvey(vm.manage.survey).then(function(res) {
        dbg.log2('#SurveyController > finishCreate > res ', res);
        if(res.error) {
          messenger.error(res.error);
        }
        else {
          changePage('index');
          messenger.ok(res.data.message || 'Successfully created survey');
        }
      });
    };

    function finishEdit() {
      surveyServices.updateSurvey(vm.manage.survey).then(function(res) {
        dbg.log2('#SurveyController > finishEdit > res ', res);
        if(res.error) {
          messenger.error(res.error);
        }
        else {
          changePage('index');
          messenger.ok(res.data.message || 'Successfully updated survey');
        }
      });
    };

    function statusIcon(survey) {
      if(survey.closed) {
        return '/icons/password_red.png';
      }
      else {
        return '/icons/password_grey.png';
      }
    };

    function chooseValidIcon(status) {
      if(status) {
        return '/icons/ic_tick.png';
      }
      else {
        return '/icons/ic_cross.png';
      }
    };

    function validateSurvey() {
      var survey = vm.manageTemp.survey;
      if(!survey.errors) {
        survey.errors = {};
      }

      if(survey.name.length == 0) {
        survey.errors.name = 'Too short';
      }
      else {
        delete survey.errors.name;
        vm.manage.survey.name = survey.name;
      }

      if(survey.description.length == 0) {
        survey.errors.description = 'Too short';
      }
      else {
        delete survey.errors.description;
        vm.manage.survey.description = survey.description;
      }

      if(vm.manage.survey.SurveyQuestions.length < 2) {
        survey.errors.submitError = 'Not enougth questions';
      }
      else {
        delete survey.errors.submitError;
      }

      return (Object.keys(survey.errors).length == 0);
    }

    function validateQuestion(order, sq) {
      if(!sq.errors) {
        sq.errors = {};
      }

      if(sq.active) {
        changeCreateObject(order, false, sq);
      }
      else {
        if(sq.name.length == 0) {
          sq.errors.name = 'Too short';
        }
        else {
          delete sq.errors.name;
        }

        if(sq.question.length == 0) {
          sq.errors.question = 'Too short';
        }
        else {
          delete sq.errors.question;
        }

        if(sq.answers) {
          var answers = Object.keys(sq.answers).length;
          if(answers < sq.minAnswers) {
            sq.errors.answer = 'Not enougth answers';
          }
          else if(answers > sq.maxAnswers){
            sq.errors.answer = 'Too many answers';
          }
          else {
            delete sq.errors.answer;
            sq.errors.answers = {};
            for(var key in sq.answers) {
              var answer = sq.answers[key];
              if(sq.type == 'radio' && answer.name.length == 0 || answer.name.length > 20) {
                sq.errors.answers[key] = 'Too short/long';
              }
            };
            if(Object.keys(sq.errors.answers).length == 0) {
              delete sq.errors.answers;
              if(sq.contact) {
                var contactDetails = [];
                for(var key in vm.contactDetails) {
                  var cd = vm.contactDetails[key];
                  if(!cd.disabled) {
                    contactDetails.push(cd);
                  }
                };
                sq.answers[0].contact = contactDetails;
              }
            }
          }
        }

        if(Object.keys(sq.errors).length == 0) {
          changeCreateObject(order, true, sq);
        }
      }
    };

    function changeCreateObject(order, status, sq) {
      if(status) {
        sq.order = order;
        vm.manage.survey.SurveyQuestions.push(sq);
        sq.active = status;
      }
      else {
        sq.active = status;
        var index = vm.manage.survey.SurveyQuestions.indexOf(sq);
        vm.manage.survey.SurveyQuestions.splice(index, 1);
      }
    };

    function questionChange(order, currentQuestion) {
      if(currentQuestion.active) {
        changeCreateObject(order, false, currentQuestion);
      }
    };

    function initQuestion(object) {
      if(!vm.manageTemp.survey.SurveyQuestions[object.order] || object.order != vm.manageTemp.survey.SurveyQuestions[object.order].order) {
        vm.manageTemp.survey.SurveyQuestions.splice(object.order, 0, {});
      }

      var question = vm.manageTemp.survey.SurveyQuestions[object.order];
      question.minAnswers = object.minAnswers;
      question.maxAnswers = object.maxAnswers;
      question.contact = object.contact;
      if(object.hardcodedName) {
        question.name = object.name;
      }

      return question;
    };

    function initAnswers(object, question) {
      if(question.answers) {
        question.active =  true;
        vm.manage.survey.SurveyQuestions[object.order] = question;
        return question.answers;
      }
      else {
        return defaultArray(object.minAnswers);
      }
    }

    function canChangeAnswers(value, question) {
      if(value > 0) {
        return (question.answers.length < question.maxAnswers);
      }
      else {
        return (question.answers.length > question.minAnswers);
      }
    };

    function changeAnswers(value, question, index) {
      changeCreateObject(question.order, false, question);
      if(value > 0) {
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
      switch(page) {
        case 'index':
          init();
          vm.currentPage = { page: page };
          break;
        case 'create':
          vm.manageTemp = { survey: { SurveyQuestions: [] } };
          vm.manage = { survey: { SurveyQuestions: [] } };
          vm.currentPage = { page: 'manage', type: page };
          break;
        case 'edit':
          vm.manageTemp = { survey: survey };
          vm.manage = { survey: { SurveyQuestions: [] } };
          vm.currentPage = { page: 'manage', type: page };
          break;
        default:
          vm.currentPage = { page: page };
      }
    };

    function addContactDetail(cd, order, sq) {
      cd.disabled = !cd.disabled;
      changeCreateObject(order, false, sq);
    };

    function copySurvey(survey) {
      surveyServices.copySurvey({ id: survey.id }).then(function(res) {
        dbg.log2('#SurveyController > copySurvey > res ', res);
        if(res.error) {
          messenger.error(res.error);
        }
        else {
          // changePage('index');
          messenger.ok(res.message || 'Survey copied successfully');
        }
      });
    };
  };
})();
