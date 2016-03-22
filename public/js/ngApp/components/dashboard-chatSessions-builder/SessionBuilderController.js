(function () {
  'use strict';

  angular.module('KliikoApp').controller('SessionBuilderController', SessionBuilderController);

  SessionBuilderController.$inject = ['dbg', 'sessionBuilderControllerServices', 'messenger', 'SessionModel','$state', '$stateParams', '$filter', 'domServices', '$ocLazyLoad', '$q', '$window', 'ngProgressFactory', '$rootScope', '$scope'];
  function SessionBuilderController(dbg, builderServices, messenger, SessionModel, $state, $stateParams, $filter, domServices, $ocLazyLoad, $q, $window, ngProgressFactory,  $rootScope, $scope) {
    dbg.log2('#SessionBuilderController started');

    var vm = this;

    var colorSchemeId, brandLogoId;
    var intervals = {};
    var sessionId = $stateParams.id || null;

    vm.step1 = {};

    vm.accordions = {};
    vm.participants = [];
    vm.observers = [];
    vm.basePath = '/js/ngApp/components/dashboard-chatSessions-builder/';
    vm.$state = $state;

    vm.session = new SessionModel(sessionId);
    builderServices.session = vm.session;

    vm.session.init().then(function(res) {
      vm.mouseOveringMember = [];

      //add session id for newly build one
      if (!$stateParams.id) {
        $state.go('dashboard.chatSessions.builder', {id: vm.session.id}, {
          location: true, inherit: false, notify: false, reload:false
        });
      }


      vm.today = new Date();
      vm.dateTime = builderServices.getTimeSettings();

      vm.participants = vm.session.steps.step4.participants;
      vm.observers = vm.session.steps.step5.observers;
      vm.chatSessionTopicsList = [];

    //  parseDateAndTime('initial');
      initStep(null, 'initial');


    });


    vm.currentStep = -1;

    vm.selectedTopics = {};
    vm.allTopicsSelected = false;

    vm.participantsFilterType = {all:true};
    vm.observersFilterType = {all:true};

    vm.closeSession = closeSession;
    vm.openSession = openSession;
    vm.stepsClassIsActive = stepsClassIsActive;
    vm.updateStep = updateStep;
    vm.goToStep = goToStep;
    vm.goToChat = goToChat;
    vm.currentPageToDisplay = currentPageToDisplay;
    vm.addFacilitatorsClickHandle = addFacilitatorsClickHandle;
    vm.facilitatorsSelectHandle = facilitatorsSelectHandle;

    // step 2

    vm.faderHack = faderHack;
    vm.topicsOnDropComplete = topicsOnDropComplete;
    vm.removeTopicFromList = removeTopicFromList;
    vm.reorderTopics = reorderTopics;
    vm.topicSelectClickHandle = topicSelectClickHandle;
    vm.selectAllTopics = selectAllTopics;

    // step3

    // step 4 + 5
    vm.showCorrectStatus = showCorrectStatus;
    vm.inviteMembers = inviteMembers;
    vm.modalWindowHandler = modalWindowHandler;
    vm.finishSelectingMembers = finishSelectingMembers;
    vm.selectParticipantsClickHandle = selectParticipantsClickHandle;
    vm.selectObserversClickHandle = selectObserversClickHandle;
    vm.selectedAllMembers = selectedAllMembers;
    vm.findSelectedMembers = findSelectedMembers;
    vm.removeFromList = removeFromList;
    vm.sendGenericEmail = sendGenericEmail;
    vm.setMembersFilter = setMembersFilter;



    function closeSession() {
      vm.session.close();
    }

    function openSession() {
      vm.session.open();
    }


    function goToStep(step) {
      if (!angular.isNumber(step)) {
        if (step === 'back')  handlePreviousStep();
        if (step === 'next') handleNextStep();
        if (step === 'finish') {
          vm.session.update();
          $state.go('dashboard.chatSessions');
          messenger.ok('New session is created');
        }
      }


      function handlePreviousStep() {
        vm.cantMoveNextStep = false;  step = vm.currentStep - 1;
        vm.session.goPreviouseStep();
        initStep(step).then(function (res) {
          vm.currentStep = step;
        });


      }

      function handleNextStep() {
        var routerProgressbar = ngProgressFactory.createInstance();
        routerProgressbar.start();

        step = vm.currentStep;

        vm.session.updateStep().then(
          function(res) {
            vm.searchingParticipants = false;
            vm.searchingObservers = false;

            vm.session.goNextStep().then(
              function (res) {
                initStep(step+1).then(function(res) {
                  $stateParams.ssessionBuilderStep = vm.currentStep = step+1;
                });

                routerProgressbar.complete();
              },
              function (err) {
                routerProgressbar.complete();
                messenger.error(err)
              }
            );

          },
          function (err) {
            routerProgressbar.complete();
            if (err) messenger.error(err);
          }
        );
      }

    }

    function goToChat(session) {
      if (session.showStatus && session.showStatus == 'Expired') return;
      $window.location.href = session.chatRoomUrl + session.id;
    }


    function initStep(step, initial) {
      var deferred = $q.defer();

      vm.lastStep = null;

      if (initial) {
        for (var key in vm.session.steps) {
          // find number in object values that looks like 'step1', 'step2'...
          if (vm.session.steps[key].stepName == vm.session.currentStep) {
            step = parseInt( key.substr(key.length - 1) );
            break;
          }
        }

      }

      showExpiresWarning();


    /*  if (step == 1) {
        // populate facilitator
        if (vm.session.steps.step2.facilitator) {
          intervals.facilitators = setInterval(function() {
            if (vm.facilitators) {
              for (var i = 0, len = vm.facilitators.length; i < len ; i++) {
                if (vm.facilitators[i].accountUserId == vm.session.steps.step2.facilitator) {
                  vm.selectedFacilitator = vm.facilitators[i];
                  break;
                }
              }
              clearInterval(intervals.facilitators);
              intervals.facilitators = null;

            }
          }, 100);

        }


        // populate logo
        if (vm.session.steps.step1.resourceId) {
          intervals.resourceId = setInterval(function() {
            if (vm.logosList) {
              for (var i = 0, len = vm.logosList.length; i < len ; i++) {
                if (vm.logosList[i].id == vm.session.steps.step1.resourceId) {
                  vm.brandLogo = vm.logosList[i];
                  break;
                }
              }
              clearInterval(intervals.resourceId);
              intervals.resourceId = null;

            }
          }, 100);
        }

        // populate color scheme
        if (vm.session.steps.step1.brandProjectPreferenceId) {

          if (vm.session.steps.step1.resourceId) {
            intervals.brandProjectPreferenceId = setInterval(function() {
              if (vm.colorsList) {
                for (var i = 0, len = vm.colorsList.length; i < len ; i++) {
                  if (vm.colorsList[i].id == vm.session.steps.step1.brandProjectPreferenceId) {
                    vm.colorScheme = vm.colorsList[i];
                    break;
                  }
                }
                clearInterval(intervals.brandProjectPreferenceId);
                intervals.brandProjectPreferenceId = null;

              }
            }, 100);
          }

        }

        deferred.resolve();
        return deferred.promise;
      }*/
      if (step == 1) {
        vm.currentStep = 1;
      }
      if (step == 2) {
        $ocLazyLoad.load( builderServices.getDependencies().step2 ).then(function(res) {
          vm.currentStep = step;

          if (vm.session.steps.step2.topics.length) vm.chatSessionTopicsList = builderServices.parseTopics(vm.session.steps.step2.topics);

          deferred.resolve();
          return deferred.promise;

        },
        function(err) {
          messenger.error(err);
          deferred.reject(err);
        });
      }
      if (step == 3) {
        $ocLazyLoad.load( builderServices.getDependencies().step3 ).then(function(res) {
          vm.currentStep = step;
        //  vm.sessionEmailTemplates = sortBySpecifiedIds(vm.session.steps.step3.emailTemplates);
          //vm.sessionEmailTemplates = vm.session.steps.step3.emailTemplates;
          vm.templateNamesToHide = {};

          $rootScope.$on('updateSessionBuilderEmails', updateSessionBuilderEmailsHandler);
          deferred.resolve();
          return deferred.promise;
        },
          function(err) {
            messenger.error(err);
            deferred.reject(err);
          });
      }
      if (step == 4) {
        $ocLazyLoad.load( builderServices.getDependencies().step4 ).then(function(res) {
          vm.currentStep = step;
          deferred.resolve();
          return deferred.promise;
        },
          function(err) {
            messenger.error(err);
            deferred.reject(err);
          });
      }
      if (step == 5) {
        $ocLazyLoad.load( builderServices.getDependencies().step5 ).then(function(res) {
          vm.currentStep = step;
          vm.lastStep = true;
          deferred.resolve();
          return deferred.promise;
        },
          function(err) {
            messenger.error(err);
            deferred.reject(err);
          });
      }

      return deferred.promise;

      function showExpiresWarning() {
        if (vm.session.sessionData && vm.session.sessionData.endTime) {
          vm.expireWarning = builderServices.getExpireDays(vm.session.sessionData.endTime);
        }

      }
    }



    function stepsClassIsActive(step) {
      return (vm.currentStep == step);
    }


    function updateStep(dataObj) {
    /*  if (dataObj == 'startTime') {
        parseDateAndTime();
        updateStep({startTime: vm.session.steps.step1.startTime});
        return;
      }

      if (dataObj == 'endTime') {
        parseDateAndTime();
        updateStep({endTime: vm.session.steps.step1.endTime});
        return;
      }*/

        vm.session.updateStep(dataObj).then(
        function (res) {
        },
        function (err) {
          messenger.error(err);
        }
      );

    }


    /**
     * convert date and time inputs to timestamp in session object -> steps -> step1 for start and rnd dates
     */
  /*  function parseDateAndTime(initial) {
      var startDate, startHours, startMinutes, endDate, endHours, endMinutes;

      if (initial) {
        vm.step1.startDate = new Date(vm.session.steps.step1.startTime);
        vm.step1.startTime = new Date(vm.session.steps.step1.startTime);

        vm.step1.endDate = new Date(vm.session.steps.step1.endTime);
        vm.step1.endTime = new Date(vm.session.steps.step1.endTime);

      } else {
        if (vm.step1.startDate && vm.step1.startTime) {
          startDate = new Date(vm.step1.startDate);
          startHours = new Date(vm.step1.startTime).getHours();
          startMinutes = new Date(vm.step1.startTime).getMinutes();

          startDate.setHours(startHours);
          startDate.setMinutes(startMinutes);

          vm.session.steps.step1.startTime = startDate;
        }

        if (vm.step1.endDate && vm.step1.endTime) {
          endDate = new Date(vm.step1.endDate);
          endHours = new Date(vm.step1.endTime).getHours();
          endMinutes = new Date(vm.step1.endTime).getMinutes();

          endDate.setHours(endHours);
          endDate.setMinutes(endMinutes);

          vm.session.steps.step1.endTime = endDate;
        }

        (new Date(startDate).getTime() > new Date(endDate).getTime() )
          ?  vm.accordions.dateAndTimeError = true
          :  vm.accordions.dateAndTimeError = false;

      }


    }
*/


    function currentPageToDisplay() {
      if ( vm.showContactsList || vm.searchingParticipants || vm.searchingObservers ) {
        return 'contactLists.html';
      }
      else if (vm.currentStep >= 0){
        if (vm.currentStep == 1) {
          return vm.basePath+'steps/step1.tplTemp.html';
        } else
          return vm.basePath+'steps/step'+vm.currentStep+'.tpl.html';
      }

      return "";
    }

    /// step 2

    function addFacilitatorsClickHandle() {
      vm.showContactsList = true;
    }

    function facilitatorsSelectHandle(facilitator) {
      vm.session.steps.step2.facilitator = facilitator;
      vm.session.addMembers(facilitator, 'facilitator').then(
        function (res) {  vm.session.update();  },
        function (err) { messenger.error(err);  }
      );


    }

    function faderHack() {
      setTimeout(function() {
        jQuery('.modal-backdrop.fade.in').hide();
      }, 10);
    }

    function topicsOnDropComplete(data, event) {
      if (!data) return;

      thisAdd(data);

      // if there more topics selected, then "drop" them also
      if ( Object.keys(vm.selectedTopics).length ) {
        for (var key in vm.selectedTopics) {
          thisAdd(vm.selectedTopics[key]);
        }
      }


      function thisAdd(data) {
        var topicIds = [];

        // check if this topic already in selected chat session topics list
        if (vm.chatSessionTopicsList.length) {
          for (var i = 0; i < vm.chatSessionTopicsList.length ; i++) {
            if (data.id ==  vm.chatSessionTopicsList[i].id ) return;
          }
          push();
        } else {
          push();

        }

        function push() {
          data.order = vm.chatSessionTopicsList.length || 0;
          vm.chatSessionTopicsList.push(data);
        }

        vm.session.steps.step2.topics = vm.chatSessionTopicsList;

        for (var i = 0, len = vm.chatSessionTopicsList.length; i < len ; i++) {
          topicIds.push(vm.chatSessionTopicsList[i].id)
        }

        vm.session.saveTopics(vm.chatSessionTopicsList).then(
          function (res) {
            dbg.log2('topic added');
          },
          function (err) {
            messenger.error(err);
          }
        );

      }

    }

    function removeTopicFromList(id) {
      for (var i = 0, len = vm.chatSessionTopicsList.length; i < len ; i++) {
        if ( id ==  vm.chatSessionTopicsList[i].id ) {
          vm.chatSessionTopicsList.splice(i, 1);
          break;
        }
      }

      vm.session.steps.step2.topics = vm.chatSessionTopicsList;

      vm.session.saveTopics().then(
        function (res) {
          dbg.log2('topic removed');
        },
        function (err) {
          messenger.error(err);
        }
      );
    }

    function reorderTopics(data, t) {
      vm.chatSessionTopicsList = builderServices.reorderTopics(vm.chatSessionTopicsList, data, t);
      vm.session.steps.step2.topics = vm.chatSessionTopicsList;
    }

    function topicSelectClickHandle(topicObj) {
      if ( vm.selectedTopics.hasOwnProperty(topicObj.id) ) {
        delete vm.selectedTopics[topicObj.id];
      } else {
        vm.selectedTopics[topicObj.id] = topicObj;
      }

    }

    function selectAllTopics(allTopics) {
      vm.allTopicsSelected = !vm.allTopicsSelected;

      vm.selectedTopics = {};
      if (vm.allTopicsSelected) {
        for (var i = 0, len = allTopics.length; i < len ; i++) {
          vm.selectedTopics[ allTopics[i].id ] = allTopics[i];
        }
      }


    }

    /// step 3
    function updateSessionBuilderEmailsHandler(e, attrs) {
      vm.session.update().then(
        function (res) {
          //vm.sessionEmailTemplates = sortBySpecifiedIds(res.sessionBuilder.steps.step3.emailTemplates);
          //vm.sessionEmailTemplates = res.sessionBuilder.steps.step3.emailTemplates;
        },
        function (err) {
          messenger.error(err);
        }
      );

    }

    /// step 4 + 5
    function showCorrectStatus(member) {
      if(member.invite) {
        return member.invite.status;
      }
      else if(member.sessionMember) {
        return 'confirmed';
      }
    }

    function inviteMembers() {
     var data = findSelectedMembers();

      if(data.length > 0) {
        var promise;
        if(vm.currentStep == 4) {
          promise = vm.session.inviteParticipants(data);
        }
        else if(vm.currentStep == 5) {
          promise = vm.session.inviteObservers(data);
        }

        promise.then(function(res) {
          for(var i in data) {
            var member = data[i];
            removeFromList(member, true);
          }

          if(vm.currentStep == 4) {
            vm.participants = vm.participants.concat(res.data);
          }
          else if(vm.currentStep == 5) {
            vm.observers = vm.observers.concat(res.data);
          }

          messenger.ok(res.message);
        }, function(error) {
          messenger.error(error);
        });
      }
      else {
        messenger.error('No contacts selected');
      }
    }

    function showSmsWindow(data) {
      if(data.length > 0) {
        var noMobile = {};
        for(var i in data) {
          var member = data[i];
          if(!member.mobile) {
            noMobile[member.firstName + ' ' + member.lastName] = ' has no mobile provided';
          }
        }

        if(Object.keys(noMobile).length == 0) {
          vm.sendSmsTo = data;
          vm.sendSmsMessage = null;
          domServices.modal('sessionBuilder-sendSmsModal');
        }
        else {
          messenger.error(noMobile);
        }
      }
      else {
        messenger.error('No contacts selected');
      }
    }

    function modalWindowHandler(modal, data) {
      if(modal === 'showSms') {
        showSmsWindow(data);
      }
      else if(modal === 'sendSms') {
        vm.session.sendSms(vm.sendSmsTo, vm.sendSmsMessage).then(function(message) {
          domServices.modal('sessionBuilder-sendSmsModal', 'close');
          messenger.ok(message);
        }, function(error) {
          messenger.error(error);
        });
      }
    }

    function selectParticipantsClickHandle() {
      vm.searchingParticipants = true;
    }

    function selectObserversClickHandle() {
      vm.searchingObservers = true;
    }



    function selectedAllMembers() {
      var members = builderServices.currentMemberList(vm);
      var stepString = builderServices.currentStepString(vm);

      for(var i in members) {
        var member = members[i];
        if(!showCorrectStatus(member)) {
           member[stepString] = vm.selectedAll;
        }
      }
    }

    function findSelectedMembers() {
      return builderServices.findSelectedMembers(vm);
    }

    function finishSelectingMembers(activeList) {
      if (vm.searchingParticipants) {
        vm.participants = vm.participants.concat(builderServices.selectMembers(activeList.id, activeList.members));
        vm.participants = builderServices.removeDuplicatesFromArray(vm.participants);
        vm.searchingParticipants = false;
      }

      if (vm.searchingObservers) {
        vm.observers = vm.observers.concat(builderServices.selectMembers(activeList.id, activeList.members));
        vm.observers = builderServices.removeDuplicatesFromArray(vm.observers);
        vm.searchingObservers = false;

      }
    }

    function removeFromList(member, skipDb) {
      if(skipDb) {
        removeMemberFromList(member);
      }
      else {
        var confirmed = confirm('Are you sure you want to do this?');
        if(!confirmed) return;

        vm.session.removeMember(member).then(function(res) {
          removeMemberFromList(member);
          messenger.ok(res.message);
        }, function(error) {
          messenger.error(error);
        });
      }
    }

    function removeMemberFromList(member) {
      var members = builderServices.currentMemberList(vm);
      var index = members.indexOf(member);
      members.splice(index, 1);
    }



    function sendGenericEmail() {
      var data = findSelectedMembers();

      if(data.length > 0) {
        vm.session.sendGenericEmail(data).then(function(res) {
          messenger.ok(res.message);
        }, function(error) {
          messenger.error(error);
        });
      }
      else {
        messenger.error('No contacts selected');
      }
    }

    function setMembersFilter(memberType, filterName) {
      var filter = {};
      filterName.length
        ? filter[filterName] = true
        : filter['all'] = true;
      vm[memberType+'FilterType'] = filter;
    }


  }

})();
