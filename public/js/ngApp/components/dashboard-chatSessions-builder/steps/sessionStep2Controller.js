(function () {
  'use strict';

  angular.module('KliikoApp').controller('SessionStep2Controller', SessionStep2Controller);

  SessionStep2Controller.$inject = ['dbg', 'sessionBuilderControllerServices', 'messenger', '$state',  '$filter', 'domServices', '$rootScope', '$scope'];
  function SessionStep2Controller(dbg, builderServices, messenger, $state, $filter, domServices, $rootScope, $scope) {
    dbg.log2('#SessionBuilderController 2 started');

    var vm = this;

    vm.step2 = {};
    vm.accordions = {};
    vm.$state = $state;


    vm.parentController;

    vm.watchers = [];
    vm.selectedTopics = [];
    vm.sessionTopics = [];

    vm.orderTopics = orderTopics;
    vm.topicsOnDropComplete = topicsOnDropComplete;
    vm.removeTopicFromList = removeTopicFromList;
    vm.reorderTopics = reorderTopics;
    vm.topicSelectClickHandle = topicSelectClickHandle;
    vm.selectAllTopics = selectAllTopics;
    vm.chatSessionTopicsList = [];

    /////////////////////////////////////////

    $scope.list = vm.selectAllTopics;
    $scope.sortingLog = [];

    $scope.sortableOptions = {
      update: function(e, ui) {
        var logEntry = tmpList.map(function(i){
          return i.value;
        }).join(', ');
        $scope.sortingLog.push('Update: ' + logEntry);
      },
      stop: function(e, ui) {
        // this callback has the changed model
        var logEntry = tmpList.map(function(i){
          return i.value;
        }).join(', ');
        $scope.sortingLog.push('Stop: ' + logEntry);
      }
    };

    /////////////////////////////////////////

    vm.initController = function() {
      initStep();
      vm.session = builderServices.session;
      vm.sessionTopics = vm.session.steps.step2.topics;
    }

    vm.canDragElement = function(element) {
      var count = 0;
      var selected = false;
      for(var i in vm.selectedTopics) {
        var topic = vm.selectedTopics[i];
        count++;
        if (topic.id == element.id) {
          selected = true;
        }
      }

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

    function topicsOnDropComplete(topic, event) {
      var data = angular.copy(topic);

      if (!data) return;
      var topicArray = [];

      if(vm.selectedTopics.length == 0 || Object.keys(vm.selectedTopics).length == 0){
        if (!isTopicAdded(data)) {
          data.order = vm.chatSessionTopicsList.length;
          topicArray.push(data);
        }
      }else{
        vm.selectedTopics.map(function(topic) {
          if (!isTopicAdded(topic)) {
            topic.order = vm.chatSessionTopicsList.length;
            topic.SessionTopics = [{order: topic.order}];
            vm.chatSessionTopicsList.push(topic);
            topicArray.push(topic);
          }
        })
      }

      if (topicArray.length == 0) return;

      saveTopics(topicArray);
    }

    function reorderTopics(topic1, topic2) {
      var order1 = topic1.SessionTopics[0].order;
      var order2 = topic2.SessionTopics[0].order;
      topic1.SessionTopics[0].order = order2;
      topic2.SessionTopics[0].order = order1;

      vm.chatSessionTopicsList.map(function(topic) {
        topic.order = topic.SessionTopics[0].order
      })

      saveTopics(vm.chatSessionTopicsList);
    }

    function saveTopics(topicArray) {
      vm.session.saveTopics(topicArray).then(function(results) {
        angular.forEach(results, function(result) {
          if (!isTopicAdded(result)) {
            vm.chatSessionTopicsList.push(result);
          }
        });
      }, function(error) {
        messenger.error(error);
      });
    }

    function removeTopicFromList(id) {
      vm.session.removeTopic(id).then(
        function (res) {
          dbg.log2('topic removed');
          removeTopicFromLocalList(id);
          reOrderOnDelete();
          saveTopics(vm.chatSessionTopicsList);
        },
        function (err) {
          messenger.error(err);
        }
      );
    }

    function removeTopicFromLocalList(id) {
      for (var i = 0, len = vm.chatSessionTopicsList.length; i < len ; i++) {
        if ( id ==  vm.chatSessionTopicsList[i].id ) {
          vm.chatSessionTopicsList.splice(i, 1);
          break;
        }
      }
    }

    function reOrderOnDelete() {
      vm.chatSessionTopicsList.map(function(topic, index) {
        if(topic.order != index){
          topic.order = index;
          topic.SessionTopics[0].order = topic.order;
        }
      })
    }

    function orderTopics(topics) {
      topics.map(function(topic, index) {
        topic.order = index;
      });
    }

    function topicSelectClickHandle(topicObj) {
      if (vm.selectedTopics[topicObj.id]) {
        delete vm.selectedTopics[topicObj.id];
      } else {
        vm.selectedTopics[topicObj.id] = topicObj;
      }

    }

    function selectAllTopics(allTopics) {
      vm.allTopicsSelected = !vm.allTopicsSelected;


      vm.selectedTopics = [];
      if (vm.allTopicsSelected) {
        for (var i = 0, len = allTopics.length; i < len ; i++) {
          vm.selectedTopics[ allTopics[i].id ] = allTopics[i];
        }
      }
    }

    function initStep() {
      var runOnce = $scope.$watch('step2Controller.session.steps.step2.topics', function (newval, oldval) {
        if (vm.session.steps.step2.topics.length) {
          vm.chatSessionTopicsList = vm.session.steps.step2.topics;
        }
        runOnce();
      });
    }

  }

})();
