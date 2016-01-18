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
    vm.chooseValidIcon = chooseValidIcon;
    vm.canChangeAnswers = canChangeAnswers;
    vm.changeAnswers = changeAnswers;
    vm.defaultArray = defaultArray;
    vm.changePage = changePage;
    vm.addContactDetail = addContactDetail;
    vm.pickValidClass = pickValidClass;
    vm.changeQuestions = changeQuestions;

    vm.answerSortOptions = {
      onUpdate: function(evt) {
        evt.models.forEach(function(val, index, array) {
          val.order = index;
        });
      }
    }

    vm.minsMaxs = {
      input: {
        min: 1,
        max: 20
      },
      textarea: {
        min: 1,
        max: 500
      }
    }
    vm.validationErrors = [
      {
        type: 'required',
        message: 'Please fill this field!',
      },
      {
        type: 'minlength',
        message: 'Field is too short!',
      },
      {
        type: 'maxlength',
        message: 'Field is too long!',
      }
    ];

    vm.contactDetails = [
      {
        model: 'firstName',
        name: 'First Name',
        input: true
      },
      {
        model: 'lastName',
        name: 'Last Name',
        input: true
      },
      {
        model: 'gender',
        name: 'Gender',
        select: true,
        options: ['Male', 'Female']
      },
      {
        model: 'age',
        name: 'Age',
        input: true
      },
      {
        model: 'email',
        name: 'Email',
        input: true
      },
      {
        model: 'mobile',
        name: 'Mobile',
        input: true
      },
      {
        model: 'landlineNumber',
        name: 'Landline Number',
        input: true,
        canDisable: true,
        disabled: true
      },
      {
        model: 'postalAddress',
        name: 'Postal Address',
        input: true,
        canDisable: true,
        disabled: true
      },
      {
        model: 'city',
        name: 'City',
        input: true,
        canDisable: true,
        disabled: true
      },
      {
        model: 'state',
        name: 'State',
        input: true,
        canDisable: true,
        disabled: true
      },
      {
        model: 'postcode',
        name: 'Postcode',
        input: true,
        canDisable: true,
        disabled: true
      },
      {
        model: 'country',
        name: 'Country',
        input: true,
        canDisable: true,
        disabled: true
      },
      {
        model: 'companyName',
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
      }
    ];

    changePage('index');

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
      var progressbar = ngProgressFactory.createInstance();
      progressbar.start();

      surveyServices.changeStatus({ id: survey.id, closed: !survey.closed }).then(function(res) {
        dbg.log2('#SurveyController > changeStatus > res ', res);
        progressbar.complete();

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
      vm.submitedForm = true;
      vm.submitingForm = true;
      var progressbar = ngProgressFactory.createInstance();
      progressbar.start();

      $timeout(function() {
        if(vm.manageForm.$valid) {
          if(vm.survey.SurveyQuestions.length < 2) {
            vm.submitError = 'Not enougth questions';
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
          vm.submitError = 'There are some errors';
        }

        progressbar.complete();
        vm.submitingForm = false;
      }, 1000);
    };

    function finishCreate() {
      surveyServices.createSurvey(vm.survey).then(function(res) {
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
      surveyServices.updateSurvey(vm.survey).then(function(res) {
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

    function copySurvey(survey) {
      var progressbar = ngProgressFactory.createInstance();
      progressbar.start();

      surveyServices.copySurvey({ id: survey.id }).then(function(res) {
        dbg.log2('#SurveyController > copySurvey > res ', res);
        progressbar.complete();

        if(res.error) {
          messenger.error(res.error);
        }
        else {
          // changePage('index');
          messenger.ok(res.message || 'Survey copied successfully');
        }
      });
    };

    function confirmSurvey(survey) {
      var progressbar = ngProgressFactory.createInstance();
      progressbar.start();

      surveyServices.confirmSurvey({ id: survey.id, confirmedAt: new Date() }).then(function(res) {
        dbg.log2('#SurveyController > confirmSurvey > res ', res);
        progressbar.complete();

        if(res.error) {
          messenger.error(res.error);
        }
        else {
          // changePage('index');
          messenger.ok(res.message || 'Survey confirmed successfully');
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

    function chooseValidIcon(status) {
      if(status) {
        return '/icons/ic_tick.png';
      }
      else {
        return '/icons/ic_cross.png';
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
          answer.contactDetails = {};
          for(var i in vm.contactDetails) {
            var contact = vm.contactDetails[i];
            if(!contact.disabled) {
              answer.contactDetails[contact.model] = contact;
            }
          }

          initContacts(answer);
        }
        else {
          vm.currentContacts = {};

          for(var i in answer.contactDetails) {
            var contact = answer.contactDetails[i];
            vm.currentContacts[contact.model] = contact.name;
          }
        }
      }
    };

    function canChangeAnswers(value, question) {
      if(value > 0) {
        return (question.answers.length < question.maxAnswers);
      }
      else {
        return (question.answers.length > question.minAnswers);
      }
    };

    function changeAnswers(value, question, index) {
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

        vm.survey = survey || { SurveyQuestions: {} };
        vm.currentPage = { page: 'manage', type: page };
      }
    };

    function addContactDetail(cd, answer) {
      cd.disabled = !cd.disabled;
      if(!cd.disabled) {
        vm.currentContacts[cd.model] = cd.name;
        answer.contactDetails[cd.model] = cd;
      }
      else {
        delete vm.currentContacts[cd.model];
        delete answer.contactDetails[cd.model];
      }
    };

    function pickValidClass(error, className) {
      return className + (error && Object.keys(error).length > 0 ? '-danger' : '-success');
    };
  };
})();
