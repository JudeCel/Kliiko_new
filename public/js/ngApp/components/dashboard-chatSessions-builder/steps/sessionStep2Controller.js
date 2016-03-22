(function () {
  'use strict';

  angular.module('KliikoApp').controller('SessionStep2Controller', SessionStep2Controller);

  SessionStep2Controller.$inject = ['dbg', 'sessionBuilderControllerServices', 'messenger', '$state',  '$filter', 'domServices', 'ngProgressFactory', '$rootScope', '$scope'];
  function SessionStep2Controller(dbg, builderServices, messenger, $state, $filter, domServices, $ocLazyLoad, ngProgressFactory,  $rootScope, $scope) {
    dbg.log2('#SessionBuilderController 1 started');

    var vm = this;

    vm.step2 = {};
    vm.accordions = {};
    vm.$state = $state;


    vm.parentController;

    vm.watchers = [];

    vm.topicsOnDropComplete = topicsOnDropComplete;
    vm.removeTopicFromList = removeTopicFromList;
    vm.reorderTopics = reorderTopics;
    vm.topicSelectClickHandle = topicSelectClickHandle;
    vm.selectAllTopics = selectAllTopics;
    
    
    
    initController();

    function initController() {
      vm.session = builderServices.session; //parentController.session;
      initStep(null, 'initial');
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

   
    function initStep(step) {
      $ocLazyLoad.load( builderServices.getDependencies().step2 ).then(function(res) {
          //vm.currentStep = step;
          debugger; //debugger
          if (vm.session.steps.step2.topics.length) vm.chatSessionTopicsList = builderServices.parseTopics(vm.session.steps.step2.topics);

          deferred.resolve();
          return deferred.promise;

        },
        function(err) {
          messenger.error(err);
          deferred.reject(err);
        });
    }


    // function updateStep(dataObj) {
    //   if (dataObj == 'startTime') {
    //     parseDateAndTime();
    //     updateStep({startTime: vm.session.steps.step1.startTime});
    //     return;
    //   }
    //
    //   if (dataObj == 'endTime') {
    //     parseDateAndTime();
    //     updateStep({endTime: vm.session.steps.step1.endTime});
    //     return;
    //   }
    //
    //     vm.session.updateStep(dataObj).then(
    //     function (res) {
    //     },
    //     function (err) {
    //       messenger.error(err);
    //     }
    //   );
    //
    // }


  

    /// step 2

    


  }

})();
