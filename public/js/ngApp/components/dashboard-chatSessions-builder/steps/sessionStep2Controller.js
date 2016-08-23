(function () {
  'use strict';

  angular.module('KliikoApp').controller('SessionStep2Controller', SessionStep2Controller);

  SessionStep2Controller.$inject = ['dbg', 'sessionBuilderControllerServices', 'messenger', 'orderByFilter'];
  function SessionStep2Controller(dbg, sessionBuilderControllerServices, messenger, orderByFilter) {
    dbg.log2('#SessionBuilderController 2 started');

    var vm = this;

    vm.allTopicsSelected = false;
    vm.sessionTopicsArray = [];
    vm.sessionTopicsObject = {};

    vm.sortableOptionsA = {
      stop : function(e, ui) {
        reOrderTopics();
        saveTopics(vm.sessionTopicsArray);
      }
    };

    vm.init = init;
    vm.canDragElement = canDragElement;
    vm.selectAllTopics = selectAllTopics;
    vm.removeTopicFromList = removeTopicFromList;
    vm.topicsOnDropComplete = topicsOnDropComplete;
    vm.changeActiveState = changeActiveState;
    vm.changeLandingState = changeLandingState;

    function init(list) {
      vm.session = sessionBuilderControllerServices.session;
      vm.topics = list;

      vm.topics.map(function(topic) {
        addSessionTopic(topic);
      });
      vm.sessionTopicsArray = orderByFilter(vm.sessionTopicsArray, "sessionTopic.order");
    }

    function addSessionTopic(topic) {
      if(topic.SessionTopics[0]) {
        var exists = vm.sessionTopicsObject[topic.id];
        vm.sessionTopicsObject[topic.id] = topic;
        vm.sessionTopicsObject[topic.id].sessionTopic = topic.SessionTopics[0];
        if(!exists) {
          vm.sessionTopicsArray.push(vm.sessionTopicsObject[topic.id]);
        }
      }
    }

    function canDragElement(topic) {
      var can = false, selected = getSelectedTopics();

      if(!selected.length) {
        return true;
      }

      for(var i in selected) {
        if(selected[i].id == topic.id) {
          can = true;
        }
      }

      return can;
    }

    function selectAllTopics() {
      vm.allTopicsSelected = !vm.allTopicsSelected;

      vm.topics.map(function(topic) {
        topic._selected = vm.allTopicsSelected;
      });
    }

    function changeActiveState(topic) {
      topic.sessionTopic.active = !topic.sessionTopic.active;
      saveTopics(vm.sessionTopicsArray);
    }

    function changeLandingState(topic) {
      vm.sessionTopicsArray.map(function(t) {
        t.sessionTopic.landing = false;
      });

      topic.sessionTopic.landing = true;
      saveTopics(vm.sessionTopicsArray);
    }

    function removeTopicFromList(id) {
      vm.session.removeTopic(id).then(function(res) {
        dbg.log2('topic removed');
        removeTopicFromLocalList(id);
        saveTopics(vm.sessionTopicsArray);
      }, function(error) {
        messenger.error(error);
      });
    }

    function topicsOnDropComplete(dragTopic) {
      var list = [];
      var selected = getSelectedTopics();

      if(selected.length) {
        selected.map(function(topic) {
          addTopics(topic, list);
        });
      }
      else {
        addTopics(dragTopic, list);
      }

      if(list.length) {
        saveTopics(list);
      }
    }

    function saveTopics(list) {
      vm.session.saveTopics(list).then(function(result) {
        result.map(function(topic) {
          addSessionTopic(topic);
        });
      }, function(error) {
        messenger.error(error);
      });
    }

    function removeTopicFromLocalList(id) {
      var found;
      vm.sessionTopicsArray.map(function(topic, index) {
        if(topic.sessionTopic.id == id) {
          found = index;
          delete vm.sessionTopicsObject[topic.id];
        }
      });

      vm.sessionTopicsArray.splice(found, 1);
      reOrderTopics();
    }

    function addTopics(topic, list) {
      if(!vm.sessionTopicsObject[topic.id]) {
        topic.sessionTopic = {
          order: vm.sessionTopicsArray.length,
          active: true,
          landing: false,
          name: topic.name,
          boardMessage: topic.boardMessage
        }
        if(list) {
          list.push(topic);
        }
      }
    }

    function reOrderTopics() {
      vm.sessionTopicsArray.map(function(topic, index) {
        topic.sessionTopic.order = index;
      });
    }

    function getSelectedTopics() {
      var array = [];
      vm.topics.map(function(topic) {
        if(topic._selected) { array.push(topic); }
      });
      return array;
    }
  }

})();
