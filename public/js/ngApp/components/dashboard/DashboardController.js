(function () {
  'use strict';

  angular.module('KliikoApp.Root').controller('DashboardController', DashboardController);

  DashboardController.$inject = ['dbg', '$state', '$stateParams', 'dashboardServices', 'messenger'];
  function DashboardController(dbg, $state, $stateParams, dashboardServices, messenger) {
    dbg.log2('#Dashboard controller started');

    var vm = this;
    vm.accountUsers = {};

    vm.initMyDashboard = initMyDashboard;
    vm.changeTab = changeTab;
    vm.activeClass = activeClass;
    vm.hasPendingInvite = hasPendingInvite;
    vm.tabCount = tabCount;

    function tabCount(accountUsers) {
      var count = 0;

      accountUsers.map(function(ac) {
        if(hasPendingInvite(ac.Invites)) {
          count++;
        }
      })

      return count;
    }

    function hasPendingInvite(invites) {
      var confirmed = true;

      if(invites.length > 0){
        invites.map(function(invite) {
          confirmed = (invite.role == vm.currentTab && invite.status == 'confirmed');
        })
      }
      return confirmed;
    }

    function initMyDashboard() {
      dashboardServices.getAllData().then(function(res) {
        if(res.error) {
          messenger.error(res.error);
        }
        else {
          vm.sessions = res.data.sessions;
          vm.accountUsers = res.data.accountUsers;
          vm.systemUrl = res.systemUrl;
          vm.dateFormat = res.dateFormat;

          if(Object.keys(vm.accountUsers).length) {
            setInitialTab();
          }
          else if(vm.sessions.length > 0) {
            vm.currentTab = 'participant';
          }
          else {
            vm.hideTabs = true;
          }
        }
      });
    }

    function setInitialTab() {
      // Order based on tabs
      var array = ['accountManager', 'facilitator', 'observer'];

      for(var i in array) {
        var role = array[i];
        if(vm.accountUsers[role]) {
          vm.currentTab = role;
          break;
        }
      }
    }

    function changeTab(tab) {
      vm.currentTab = tab;
    }

    function activeClass(tab) {
      return vm.currentTab == tab ? 'active' : '';
    }
  }
})();
