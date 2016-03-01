(function () {
  'use strict';

  angular.module('KliikoApp.Root').controller('DashboardController', DashboardController);

  DashboardController.$inject = ['dbg', '$state', '$stateParams', 'dashboardServices', 'messenger'];
  function DashboardController(dbg, $state, $stateParams, dashboardServices, messenger) {
    dbg.log2('#Dashboard controller started');

    var vm = this;
    vm.accountUsers = {};
    vm.tabs = {}

    vm.initMyDashboard = initMyDashboard;
    vm.changeTab = changeTab;
    vm.activeClass = activeClass;

    function initMyDashboard() {
      dashboardServices.getAllData().then(function(res) {
        if(res.error) {
          messenger.error(res.error);
        }
        else {
          vm.sessions = res.data.sessions;
          vm.accountUsers = res.data.accountUsers;
          vm.systemUrl = res.systemUrl;

          if(vm.sessions.length > 0) {
            vm.currentTab = 'participant';
            if(!vm.accountUsers) {
              vm.hideTabs = true;
            }
          }
          else {
            vm.currentTab = (vm.accountUsers.accountManager && 'accountManager')
                         || (vm.accountUsers.observer && 'observer')
                         || (vm.accountUsers.facilitator && 'facilitator');
          }
        }
      });
    }

    function changeTab(tab) {
      vm.currentTab = tab;
    }

    function activeClass(tab) {
      return vm.currentTab == tab ? 'active' : '';
    }
  }


})();
