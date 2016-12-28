(function () {
  'use strict';

  angular.module('KliikoApp.Root').controller('DashboardController', DashboardController);

  DashboardController.$inject = ['dbg', 'dashboardServices', 'goToChatroom', 'messenger'];
  function DashboardController(dbg, dashboardServices, goToChatroom, messenger) {
    dbg.log2('#Dashboard controller started');

    var vm = this;
    initMyDashboard();
    vm.initMyDashboard = initMyDashboard;
    vm.disablePlayButton = false;
    vm.hasOwnAccount = false;
    vm.showCreateNewAccountBanner = false;
    vm.canCreateNewAccount = false;
    vm.hasRoles = false;
    vm.theOnlySessionIsClosed = false;
    vm.theOnlySessionIsPending = false;
    vm.theOnlyPendingSessionTime = null;
    vm.hideTabs = false;

    vm.redirectToChatSession = redirectToChatSession;
    vm.isTabActive = isTabActive;
    vm.changeTab = changeTab;
    vm.activeClass = activeClass;
    vm.initMobile = initMobile;
    vm.activeTabText = activeTabText;
    vm.sessionBuilderUrl = sessionBuilderUrl;
    vm.isSelectRoleMessageVisible = isSelectRoleMessageVisible;
    vm.initTimer = initTimer;

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
        if (res.error) {
          messenger.error(res.error);
        } else {
          $('.main-first-page').removeClass('hidden');
          vm.accountUsers = res.data || {};
          vm.dateFormat = res.dateFormat;
          vm.hasOwnAccount = res.hasOwnAccount;
          vm.hasRoles = res.hasRoles;
          vm.canCreateNewAccount = res.canCreateNewAccount;
          vm.showCreateNewAccountBanner = !vm.hasOwnAccount;
          vm.theOnlySessionIsClosed = res.theOnlySessionIsClosed;
          vm.theOnlySessionIsPending = res.theOnlySessionIsPending;
          vm.theOnlyPendingSessionTime = res.theOnlyPendingSessionTime;
          vm.hideTabs = !vm.hasRoles || res.theOnlySessionIsPending || res.theOnlySessionIsClosed;
          setInitialTabIfAccountHasOneRoleOnly();
        }
      });
    }

    function initTimer() {
      var offset = -(new Date()).getTimezoneOffset()/60;
      $('#PendingSessionCountdown').countdown({
        date: vm.theOnlyPendingSessionTime,
        offset: offset
      }, function () {
        vm.initMyDashboard();
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

    function setInitialTabIfAccountHasOneRoleOnly() {
      var roles = Object.keys(vm.accountUsers);

      if (roles.length == 1) {
        vm.currentTab = roles[0];
      }
    }
  }
})();
