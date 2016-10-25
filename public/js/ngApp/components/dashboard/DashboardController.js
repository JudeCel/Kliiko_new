(function () {
  'use strict';

  angular.module('KliikoApp.Root').controller('DashboardController', DashboardController);

  DashboardController.$inject = ['dbg', 'dashboardServices', 'goToChatroom', 'messenger'];
  function DashboardController(dbg, dashboardServices, goToChatroom, messenger) {
    dbg.log2('#Dashboard controller started');

    var vm = this;
    initMyDashboard();
    vm.disablePlayButton = false;
    vm.isAccountManager = false;
    vm.hasRoles = false;

    vm.redirectToChatSession = redirectToChatSession;
    vm.isTabActive = isTabActive;
    vm.changeTab = changeTab;
    vm.activeClass = activeClass;
    vm.initMobile = initMobile;
    vm.activeTabText = activeTabText;
    vm.sessionBuilderUrl = sessionBuilderUrl;
    vm.isSelectRoleMessageVisible = isSelectRoleMessageVisible;

    function isSelectRoleMessageVisible() {
      return vm.accountUsers && Object.keys(vm.accountUsers).length > 1;
    }

    function sessionBuilderUrl(accountUser) {
      return accountUser.dashboardUrl + accountUser.session.id;
    }

    function activeTabText() {
      var activeTab = vm.accountUsers[vm.currentTab];
      return activeTab.name + " (" + activeTab.data.length + ")";
    }

    function initMobile(block) {
      $('#' + block + ' li:last-child').click(function () {
        $('#nav-tabs-mobile-title').text($(this).text());
      });
    }

    function redirectToChatSession(sessionId) {
      vm.disablePlayButton = true;

      goToChatroom.go(sessionId).then(function(url) {
        vm.disablePlayButton = false;
      }, function(error) {
        vm.disablePlayButton = false;
      });
    }

    function initMyDashboard() {
      dashboardServices.getAllData().then(function(res) {
        if(res.error) {
          messenger.error(res.error);
        }
        else {
          $('.main-first-page').removeClass('hidden');
          vm.accountUsers = res.data || {};
          vm.dateFormat = res.dateFormat;
          vm.isAccountManager = vm.accountUsers["accountManager"] ? true : false;
          vm.hasRoles = Object.keys(vm.accountUsers).length > 0;
          setInitialTab();
        }
      });
    }

    function isTabActive(tab) {
      return vm.currentTab == tab;
    }

    function changeTab(tab) {
      vm.currentTab = tab;
    }

    function activeClass(tab) {
      return isTabActive(tab) ? 'active' : '';
    }

    function setInitialTab() {
      var array = ['accountManager', 'facilitator', 'participant', 'observer'];

      if(vm.accountUsers) {
        for(var i in array) {
          var role = array[i];
          if(vm.accountUsers[role]) {
            vm.currentTab = role;
            break;
          }
        }
      }
    }
  }
})();
