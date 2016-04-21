(function () {
  'use strict';

  angular.module('KliikoApp').controller('SessionStep2Controller', SessionStep2Controller);

  SessionStep2Controller.$inject = ['dbg', 'sessionBuilderControllerServices', 'messenger', '$state',  '$filter', 'domServices','$ocLazyLoad', '$rootScope', '$scope'];
  function SessionStep2Controller(dbg, builderServices, messenger, $state, $filter, domServices, $ocLazyLoad,  $rootScope, $scope) {
    dbg.log2('#SessionBuilderController 2 started');

    var vm = this;

    vm.step2 = {};
    vm.accordions = {};
    vm.$state = $state;


    vm.parentController;

    vm.watchers = [];
    vm.selectedTopics = [];

    vm.topicsOnDropComplete = topicsOnDropComplete;
    vm.removeTopicFromList = removeTopicFromList;
    vm.reorderTopics = reorderTopics;
    vm.topicSelectClickHandle = topicSelectClickHandle;
    vm.selectAllTopics = selectAllTopics;
    vm.chatSessionTopicsList = [];

    vm.initController = function() {
      initStep();
      vm.session = builderServices.session;
    }

    vm.canDragElement = function(element) {
      var count = 0;
      var selected = false;
      vm.selectedTopics.map(function(item, val) {
        count++;
        if (val == element.id) {
          selected = true;
        }
      });

      if (count == 0) {
        return true;
      } else {
        return selected;
      }
    }

    function isTopicAdded(topic) {
      var present = false;
      vm.chatSessionTopicsList.map(function(item){
        if (topic.id == item.id) {
          present = true;
        }
      });
      return present;
    }

    function topicsOnDropComplete(data, event) {
      if (!data) return;
      var topicArray = [];

      if(vm.selectedTopics.length == 0){
        if (!isTopicAdded(data)) {
          topicArray.push(data);
        }
      }else{
        for (var key in vm.selectedTopics) {
          if (!isTopicAdded(vm.selectedTopics[key])) {
            topicArray.push(vm.selectedTopics[key]);
          }
        }
      }

      if (topicArray.length == 0) return;

      vm.session.saveTopics(topicArray).then(function(results) {
        angular.forEach(results, function(result) {
          if (!isTopicAdded(result.Topic)) {
            vm.chatSessionTopicsList.push(result.Topic);
          }
        });
      }, function(error) {
        messenger.error(err);
      });
    }

    function removeTopicFromLocalList(id) {
      for (var i = 0, len = vm.chatSessionTopicsList.length; i < len ; i++) {
        if ( id ==  vm.chatSessionTopicsList[i].id ) {
          vm.chatSessionTopicsList.splice(i, 1);
          break;
        }
      }
    }

    function removeTopicFromList(id) {
      vm.session.removeTopic(id).then(
        function (res) {
          dbg.log2('topic removed');
          removeTopicFromLocalList(id);
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


    function initStep() {
      var runOnce = $scope.$watch('step2Controller.session.steps.step2.topics', function (newval, oldval) {
        if (vm.session.steps.step2.topics.length) {
          vm.chatSessionTopicsList = builderServices.parseTopics(vm.session.steps.step2.topics);
        }
        runOnce();
      });
    }
  }

})();
