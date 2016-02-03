(function () {
  'use strict';

  angular.
    module('KliikoApp').
    controller('TopicsController', TopicsController);

  TopicsController.$inject = ['dbg', 'domServices', 'topicsAndSessions','ngProgressFactory','messenger'];
  function TopicsController(dbg, domServices, topicsAndSessions, ngProgressFactory, messenger) {
    dbg.log2('#TopicsController controller started');

    var vm = this;
    var tempName;

    vm.list = [];

    vm.nameMaxSize = 15;
    vm.newTopicName = null;
    vm.editBlockHelper = null;

    vm.createNew = createNewTopic;
    vm.validateNewAndAdd = validateNewAndAdd;
    vm.deleteTopic = deleteTopic;
    vm.toggleEditBlock = toggleEditBlock;
    vm.edit = edit;
    vm.saveInline = saveInline;

    init();

    function init() {
      var progressbar = ngProgressFactory.createInstance();
      progressbar.start();

      topicsAndSessions.getAllTopics().then(
        function(res) {
          dbg.log2('#TopicsController > getAllTopics > success > ', res);
          vm.list = res;
          progressbar.complete();
        },
        function(err) {
          progressbar.complete();
          dbg.error('#TopicsController > getAllTopics > error:', err);
          messenger.error('There is an error while fetching data!');
        }
      )
    }


    function createNewTopic() { domServices.modal('createNewTopic') }

    function validateNewAndAdd(topic) {
      if (!topic && !vm.newTopicName.length) return;

      var progressbar = ngProgressFactory.createInstance();
      progressbar.start();

      var params = {};

      if (!topic) {
        params.name = vm.newTopicName;
      } else {
        params = topic;
      }

      topicsAndSessions.createNewTopic(params).then(success, error);
      function success(res) {
        vm.list.push(res.data);
        domServices.modal('createNewTopic', 'close');
        progressbar.complete();
        dbg.log('#TopicsController > validateNewAndAdd > New topic has been added');
        vm.newTopicName = null;

        topic
          ? messenger.ok('New copy has been added')
          : messenger.ok('New Topic has been added');

      }
      function error(err) {
        progressbar.complete();
        messenger.error(err);
      }
    }

    function deleteTopic(id) {
      if (!id) {
        dbg.error('TopicsController > deleteTopic > something wrong with topic id!');
        return;
      }

      var doIt = confirm('Delete this Topic?');

      if (!doIt) return;

      var progressbar = ngProgressFactory.createInstance();
      progressbar.start();
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
        
        progressbar.complete();
        dbg.log('#TopicsController > deleteTopic > topic has been removed');
        messenger.ok('Topic has been removed');

      }

      function error(err) {
        progressbar.complete();
        messenger.error(err);
      }
    }

    function toggleEditBlock(blockIndex) {
      jQuery('#edit-block-'+blockIndex).toggle();
    }

    function edit(blockIndex) {
      tempName = vm.list[blockIndex].name;
      toggleEditBlock(blockIndex);

      vm.editBlockHelper = blockIndex;
    }

    function saveInline(blockIndex, newName) {
      var newName = newName || tempName;
      vm.list[blockIndex].name = newName;

      messenger.ok('Topic name changed');
      vm.editBlockHelper = null;

      topicsAndSessions.updateTopic(vm.list[blockIndex]).then(success, error);
      function success(res) { dbg.log('#TopicsController > saveInline > topic name has been updated'); }
      function error(err) {
        messenger.error(err);
        dbg.error(err);
      }
    }

  }
})();