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

    vm.nameMaxSize = 15;
    vm.newTopicName = null;
    vm.editBlockHelper = null;
    vm.modalAction = '';
    vm.topicModalTitle = '';
    vm.topicData = {};
    vm.editTopicIndex = null;

    vm.deleteTopic = deleteTopic;
    vm.openModal = openModal;
    vm.submitModalForm = submitModalForm;

    init();

    function init() {
      topicsAndSessions.getAllTopics().then(
        function(res) {
          dbg.log2('#TopicsController > getAllTopics > success > ', res);
          vm.list = res;
        },
        function(err) {
          dbg.error('#TopicsController > getAllTopics > error:', err);
          messenger.error(err);
        }
      )
    }

    function openModal(action, topic) {
      vm.modalAction = action;

      if(vm.modalAction == 'edit'){
        vm.editTopicIndex = vm.list.indexOf(topic);
        angular.copy(topic, vm.topicData);
        setEditData();
      }else if(vm.modalAction = "new") {
        vm.topicData = {};
        setCreateData()
      }

      $('#topicModalWindow').on('shown.bs.modal', function (e) {
        $("input#new-topic-input").focus();
      });
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
      if(vm.modalAction == 'edit'){
        editTopic();
      }else if(vm.modalAction = "new") {
        createTopic();
      }
    }

    function editTopic() {
      topicsAndSessions.updateTopic(vm.topicData).then(function(res) {
        vm.list[vm.editTopicIndex] = vm.topicData;
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
        messenger.ok(res.message);
        domServices.modal('topicModalWindow', 'close');
        vm.topicData = {};
      }, function(error) {
        messenger.error(error)
      });
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

        dbg.log('#TopicsController > deleteTopic > topic has been removed');
        messenger.ok(res.message);

      }

      function error(err) {
        messenger.error(err);
      }
    }
  }
})();
