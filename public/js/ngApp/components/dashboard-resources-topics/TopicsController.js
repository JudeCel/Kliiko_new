(function () {
  'use strict';

  angular.
    module('KliikoApp').
    controller('TopicsController', TopicsController);

  TopicsController.$inject = ['dbg', 'domServices', 'topicsAndSessions', 'messenger'];
  function TopicsController(dbg, domServices, topicsAndSessions, messenger) {
    dbg.log2('#TopicsController controller started');

    var vm = this;
    var tempName;

    vm.list = [];
    vm.validations = {};

    vm.newTopicName = null;
    vm.editBlockHelper = null;
    vm.modalAction = '';
    vm.topicModalTitle = '';
    vm.topicData = {};
    vm.editTopicIndex = null;
    vm.session = null;
    vm.type = null;

    vm.typeCount = {
      all: 0,
      stock: 0,
      notStock: 0
    }

    vm.pagination = {
      totalItems: 0,
      currentPage: 1,
      itemsPerPage: 24,
      items: []
    }

    vm.canDelete = canDelete;
    vm.deleteTopic = deleteTopic;
    vm.openModal = openModal;
    vm.submitModalForm = submitModalForm;
    vm.charactersLeft = charactersLeft;
    vm.togglePanel = togglePanel;
    vm.setType = setType;
    vm.prepareCurrentPageItems = prepareCurrentPageItems;

    init();

    function init() {
      topicsAndSessions.getAllTopics().then(
        function(res) {
          dbg.log2('#TopicsController > getAllTopics > success > ', res);
          vm.list = res.topics;
          vm.validations = res.validations;
          vm.prepareCurrentPageItems();
        },
        function(err) {
          dbg.error('#TopicsController > getAllTopics > error:', err);
          messenger.error(err);
        }
      )
    }

    function setType(type) {
      vm.type = type;
      vm.pagination.currentPage = 1;
      vm.prepareCurrentPageItems();
    }

    function prepareCurrentPageItems() {
      if (vm.list && vm.list.length > 0) {
        //prepare count of items by type and array of items of current type to display
        vm.typeCount.all = vm.list.length;
        vm.typeCount.stock = 0;
        vm.typeCount.notStock = 0;
        var currentTypeItems = [];
        for (var i = 0, len = vm.list.length; i < len; i++) {
          if (vm.list[i].stock == (vm.type == 'stock') || !vm.type) {
            currentTypeItems.push(vm.list[i]);
          }
          if (vm.list[i].stock) {
            vm.typeCount.stock++;
          } else {
            vm.typeCount.notStock++;
          }
        }
        vm.pagination.totalItems = currentTypeItems.length;

        //decrease page number (f.e. if item removed don't to show empty page)
        while ((vm.pagination.currentPage - 1) * vm.pagination.itemsPerPage >= currentTypeItems.length) {
          vm.pagination.currentPage--;
        }

        //prepare current page items to display
        vm.pagination.items = currentTypeItems.slice(((vm.pagination.currentPage - 1) * vm.pagination.itemsPerPage), ((vm.pagination.currentPage) * vm.pagination.itemsPerPage));
      }
      else {
        vm.pagination.items = [];
        vm.pagination.totalItems = 0;
      }
    }

    function openModal(action, topic) {
      vm.modalAction = action;

      if(vm.modalAction == 'edit'){
        vm.editTopicIndex = vm.list.indexOf(topic);
        angular.copy(topic, vm.topicData);
        setEditData();
      }else if(vm.modalAction == 'new') {
        vm.topicData = {};
        setCreateData();
      }
      else if(vm.modalAction == 'sessionTopic') {
        vm.originalReference = topic;
        angular.copy(topic, vm.topicData);
        setEditData();
      }
    };

    function setEditData() {
      domServices.modal('topicModalWindow');
      vm.topicModalTitle = 'Edit Topic'
    }

    function setCreateData() {
      domServices.modal('topicModalWindow');
      vm.topicModalTitle = 'Create New Topic';
    }

    function submitModalForm() {
      vm.topicData.boardMessage = vm.topicData.boardMessage || '';
      if(vm.modalAction == 'edit'){
        editTopic();
      }else if(vm.modalAction == 'new') {
        createTopic();
      }else if(vm.modalAction == 'sessionTopic') {
        updateSessionTopic();
      }
    }

    function charactersLeft(type) {
      return vm.topicData[type] ? (vm.validations[type] - vm.topicData[type].length) : vm.validations[type];
    }

    function togglePanel(t) {
      t._showPanel = !t._showPanel;
    }

    function updateSessionTopic() {
      topicsAndSessions.updateSessionTopic(vm.topicData, vm.session).then(function (res) {
        if (res.ignored && vm.resetSessionTopics) {
          vm.resetSessionTopics(vm);
        } else {
          angular.copy(vm.topicData, vm.originalReference);
          messenger.ok(res.message);
        }
        domServices.modal('topicModalWindow', 'close');
        vm.topicData = {};
      }, function(error) {
        messenger.error(error)
      });
    }

    function editTopic() {
      topicsAndSessions.updateTopic(vm.topicData).then(function(res) {
        if (res.data.id == vm.topicData.id) {
          vm.list[vm.editTopicIndex] = vm.topicData;
        } else {
          vm.list.push(res.data);
          vm.prepareCurrentPageItems();
        }
        messenger.ok(res.message);
        domServices.modal('topicModalWindow', 'close');
        vm.topicData = {};
      }, function(error) {
        messenger.error(error)
      });
    }

    function createTopic() {
      topicsAndSessions.createNewTopic(vm.topicData).then(function(res) {
        vm.list.push(res.data);
        vm.prepareCurrentPageItems();
        messenger.ok(res.message);
        domServices.modal('topicModalWindow', 'close');
        vm.topicData = {};
      }, function(error) {
        messenger.error(error)
      });
    }

    function canDelete(topic, isAdmin) {
      return !topic.default && (!topic.stock || isAdmin);
    }

    function deleteTopic(id) {
      if (!id) {
        dbg.error('TopicsController > deleteTopic > something wrong with topic id!');
        return;
      }

      var doIt = confirm('Delete this topic?');

      if (!doIt) return;

      topicsAndSessions.deleteTopic(id).then(success, error);

      function success(res) {
        // remove from view
        var index;
        for (var i = 0, len = vm.list.length; i < len ; i++) {
          if (vm.list[i].id === id) {
            index = i;
            break;
          }
        }
        vm.list.splice(index, 1);
        vm.editBlockHelper = null;
        vm.prepareCurrentPageItems();

        dbg.log('#TopicsController > deleteTopic > topic has been removed');
        messenger.ok(res.message);

      }

      function error(err) {
        messenger.error(err);
      }
    }
  }
})();
