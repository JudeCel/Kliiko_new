(function () {
  'use strict';

  angular.module('KliikoApp.sessionExpire', []).factory('sessionExpire', sessionExpireFactory);

  sessionExpireFactory.$inject = ['$q', 'globalSettings', '$resource', 'dbg', 'domServices'];
  function sessionExpireFactory($q, globalSettings, $resource, dbg, domServices) {
    var pingApi = $resource(globalSettings.restUrl + '/ping', null, {
      post: { method: 'post' }
    });

    var vm = {};
    //vm.expireTime = 4 * 3600 * 1000; // 4h
    vm.expireTime = 15 * 60 * 1000; // 15m
    //vm.expireTime = 10 * 1000; // 10s
    vm.pingTime = 5 * 60 * 1000; // 5m
    vm.dialogTimeout = 28; // 28s
    vm.currentDialogTimeout = -1;
    vm.init = init;
    vm.modalInited = false;
    return vm;

    function init() {
      dbg.log2('#KliikoApp.sessionExpire > init > ' + vm.expireTime + 'ms');
      scheduleNextSessionTimeout();
      setInterval(doPing, vm.pingTime);
    }

    function scheduleNextSessionTimeout() {
      setTimeout(showExpireDialog, vm.expireTime);
    }

    function doLogout() {
      location.href = "/logout";
    }

    function doContinue() {
      vm.currentDialogTimeout = -1;
      doPing();
      scheduleNextSessionTimeout();
      domServices.modal('sessionExpireModal', "close");
    }

    function doPing() {
      pingApi.post();
    }

    function dialogTimeoutCountdown() {
      if (vm.currentDialogTimeout >= 0) {
        vm.currentDialogTimeout--;
        if (vm.currentDialogTimeout == 0) {
          doLogout();
        } else {
          setTimeout(dialogTimeoutCountdown, 1000);
          jQuery("#sessionExpireModal #dialogTimeout").text(vm.currentDialogTimeout.toString());
        }
      }
    }

    function initModal() {
      var modal = '<div id="sessionExpireModal" class="modal fade" role="dialog"> \
        <div class="modal-dialog sessionExpireModal"> \
          <div class="modal-content border-green border-radius-none"> \
            <div class="modal-header"> \
              <h2 class="modal-title text-center">This session is about to expire</h2> \
            </div> \
            <div class="modal-body"> \
              <div class="form-group"> \
                  <center>Your session will be locked in <span id="dialogTimeout">' + vm.dialogTimeout.toString() + '</span> seconds. Do you want to continue your session?</center> \
              </div> \
            </div> \
            <div class="modal-footer"> \
              <div type="button" class="btn btn-standart pull-left btn-red" role="button">No, Logout</div> \
              <div type="submit" class="btn btn-standart pull-right btn-green" role="button">Yes, keep working</div> \
            </div> \
          </div> \
        </div> \
      </div>';

      var parent = jQuery('body');
      parent.prepend(modal);
    }

    function showExpireDialog() {
      if (!vm.modalInited) {
        initModal();
        vm.modalInited = true;
      }

      domServices.modal('sessionExpireModal');
      vm.currentDialogTimeout = vm.dialogTimeout;

      jQuery("#sessionExpireModal .modal-footer .btn-red").click(function() {
        doLogout();
      });
      jQuery("#sessionExpireModal .modal-footer .btn-green").click(function() {
        doContinue();
      });
      setTimeout(dialogTimeoutCountdown, 1000);
    }

  }
})();
