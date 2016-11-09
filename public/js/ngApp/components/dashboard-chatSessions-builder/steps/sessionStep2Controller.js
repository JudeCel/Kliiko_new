(function () {
  'use strict';

  angular.module('KliikoApp').controller('SessionStep2Controller', SessionStep2Controller);

  SessionStep2Controller.$inject = ['dbg', 'sessionBuilderControllerServices', 'messenger', 'orderByFilter', '$scope'];
  function SessionStep2Controller(dbg, sessionBuilderControllerServices, messenger, orderByFilter, $scope) {
    dbg.log2('#SessionBuilderController 2 started');

    var vm = this;
    var landingSign = "Click to access Topics";

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
    vm.onDragMove = onDragMove;
    vm.onDragEnd = onDragEnd;
    vm.onDragStart = onDragStart;
    vm.draggingOptions = {};

    function init(topicController) {
      vm.session = sessionBuilderControllerServices.session;
      vm.topics = vm.session.steps.step2.topics;
      vm.topicController = topicController;

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

    function selectAllTopics(list) {
      vm.allTopicsSelected = !vm.allTopicsSelected;

      list.map(function(topic) {
        topic._selected = vm.allTopicsSelected;
      });
    }

    function changeActiveState(topic) {
      saveTopics(vm.sessionTopicsArray);
    }

    function changeLandingState(topic) {
      vm.sessionTopicsArray.map(function(t) {
        if (t.sessionTopic.landing) {
          t.sessionTopic.landing = false;
          if (landingSign == t.sessionTopic.sign) {
            t.sessionTopic.sign = t.sessionTopic.lastSign;
            t.sessionTopic.lastSign = null;
          }
        }
      });

      setLanding(topic);
      saveTopics(vm.sessionTopicsArray);
    }

    function removeTopicFromList(id) {
      vm.session.removeTopic(id).then(function(res) {
        dbg.log2('topic removed');
        removeTopicFromLocalList(id);
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
        if(!findLandingTopic()) {
          setLanding(list[0]);
        }
        saveTopics(list);
      }
    }

    function setLanding(item) {
      item.sessionTopic.landing = true;
      item.sessionTopic.lastSign = item.sessionTopic.sign;
      item.sessionTopic.sign = landingSign;
    }

    function findLandingTopic() {
      for(var i in vm.sessionTopicsArray) {
        if(vm.sessionTopicsArray[i].sessionTopic.landing) {
          return vm.sessionTopicsArray[i];
        }
      }
      return false;
    }

    function saveTopics(list) {
      vm.session.saveTopics(list).then(function(result) {
        orderByFilter(result, "id").map(function(topic) {
          addSessionTopic(topic);
        });
      }, function(error) {
        messenger.error(error);
      });
    }

    function removeTopicFromLocalList(id) {
      var deletedLanding, found;
      vm.sessionTopicsArray.map(function(topic, index) {
        if(topic.id == id) {
          found = index;
          deletedLanding = topic.sessionTopic.landing;
          delete vm.sessionTopicsObject[topic.id];
        }
      });

      vm.sessionTopicsArray.splice(found, 1);
      reOrderTopics();

      if(deletedLanding && vm.sessionTopicsArray[0]) {
        changeLandingState(vm.sessionTopicsArray[0]);
      }
    }

    function addTopics(topic, list) {
      if(!vm.sessionTopicsObject[topic.id]) {
        topic.sessionTopic = {
          order: vm.sessionTopicsArray.length,
          active: true,
          landing: false,
          name: topic.name,
          boardMessage: topic.boardMessage,
          sign: topic.sign,
          lastSign: null
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
      vm.topicController.list.map(function(topic) {
        if(topic._selected) { array.push(topic); }
      });
      return array;
    }

    function onDragMove() {
        if (vm.draggingOptions.isSelectedMoreThanOneTopic) {
          processMultipleSelectedTopics();
        }
    }

    function onDragEnd() {
      var items = getTopicElements();
      var css = {
        'transform' : 'none',
        'z-index' : '1'
      };

      for (var i = 0; i < items.length; i++) {
        items.eq(i).css(css);
      }
    }

    function onDragStart() {
      initDraggingOptions();
      initDraggingOffsetOptions();
    }

    function initDraggingOptions() {
      var items = getTopicElements();
      var draggingItem = $('.topic-list-item.dragging');
      vm.draggingOptions = {
        isSelectedMoreThanOneTopic : isSelectedMoreThanOneTopic(),
        items: items,
        draggingItem: draggingItem,
        itemHeight: draggingItem.innerHeight(),
        mainDraggingElementIndex: getMainDraggingElementIndex(items),
        selectedTopics: getSelectedTopics(),
        offsetOptions: []
      };
    }

    function initDraggingOffsetOptions() {
      var processedItems = 0;
      var delta = 1;

      // drag items bottom to main dragging topic
      for (var i = vm.draggingOptions.mainDraggingElementIndex + delta; i < vm.draggingOptions.items.length; i++) {
        if (isSelectedTopicElement(vm.draggingOptions.items.eq(i))) {
          var moves = i - vm.draggingOptions.mainDraggingElementIndex - processedItems - delta;
          processedItems++;
          pushToOffsetOptions(moves, i);
        }
      }

      processedItems = 0;
      // drag items on top of main dragging topic
      for (var i = vm.draggingOptions.mainDraggingElementIndex - delta; i >= 0; i--) {
        if (isSelectedTopicElement(vm.draggingOptions.items.eq(i))) {
          var moves = vm.draggingOptions.mainDraggingElementIndex - i - processedItems - delta;
          moves *= -delta;
          processedItems++;
          pushToOffsetOptions(moves, i);
        }
      }
    }

    function pushToOffsetOptions(moves, index) {
      var offset = vm.draggingOptions.itemHeight * moves;
      vm.draggingOptions.offsetOptions.push({
        offset: offset,
        index: index
      });
    }

    function isSelectedMoreThanOneTopic() {
      return getSelectedTopics().length > 1;
    }

    function processMultipleSelectedTopics() {
      var matrix = getTransformMatrix(vm.draggingOptions.draggingItem);
      var initialTransformMatrixTop = matrix[matrix.length - 1].replace(')', '');
      var matrixUnchagedPart = matrix[0] + ', ' + matrix[1] + ', ' + matrix[2] + ', ' + matrix[3] + ', ' + matrix[4] + ', ';
      var offsetOptions = vm.draggingOptions.offsetOptions;

      for (var i = 0; i < offsetOptions.length; i++) {
        var adjustedTransformMatrixTop = initialTransformMatrixTop - offsetOptions[i].offset;
        var css = {
          'transform': matrixUnchagedPart + adjustedTransformMatrixTop + ')',
        };

        vm.draggingOptions.items.eq(offsetOptions[i].index).css(css);
      }
    }

    function getTopicElements() {
      return $('.topic-list-item');
    }

    function getTransformMatrix(draggingItem) {
      var transform = draggingItem.css('transform');
      return transform.split(',');
    }

    function getMainDraggingElementIndex(items) {
      for (var i = 0; i < items.length; i++) {
        if (items.eq(i).hasClass('dragging')) {
          return i;
        }
      }
    }

    function isSelectedTopicElement(item) {
      for (var i = 0; i < vm.draggingOptions.selectedTopics.length; i++) {
        var selectedTopicName = vm.draggingOptions.selectedTopics[i].name;
        var itemText = item.text().trim();
        if (selectedTopicName == itemText) {
          return true;
        }
      }

      return false;
    }
  }

})();
