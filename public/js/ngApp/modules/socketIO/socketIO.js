(function () {
  'use strict';

  angular.module('socketIO', ['debModule']).factory('socketIO', socketIOFactory);

  socketIOFactory.$inject = ['$rootScope','dbg', 'globalSettings'];
  function socketIOFactory($rootScope,  dbg,  globalSettings) {
    var socket;

    var socketIOPublicMethods = {
      init: function init() {
        dbg.log2('#socketIO > init');

        jQuery.getScript('/js/vendors/socket.io/socket.io-1.3.7.js', function (data) {
          initSocketIo();
        });

        function initSocketIo() {
          dbg.log2('#socketIO > socket.io is loaded as window.io');
          socket = io(globalSettings.appFullUrl);

          initListeners();
        }
      }
    };

    socketIOPublicMethods.getSocketId = getSocketId;
    socketIOPublicMethods.getId = getSocketId;

    socketIOPublicMethods.on = onEventWrapper;
    socketIOPublicMethods.removeListener = removeListener;


    return socketIOPublicMethods;


    function getSocketId() {
      return io().io.engine.id;
    }

    /**
     * Wrap io events
     * @param eventName {string}
     * @param [callback] {function}
     */
    function onEventWrapper(eventName, callback) {
      socket.on(eventName, function(data) {
        if (callback && typeof(callback) === "function") callback(data);
        setTimeout(function () { $rootScope.$apply() }, 20);
      });
    }


    function removeListener(name) {
      if (!name) {
        dbg.error('#socketIO > removeListener > @name param is required!');
        return;
      }
      socket.removeListener(name);
      dbg.log2('#socketIO > removeListener > "' + name+'" listener has been removed');

    }

    // All socket events here
    function initListeners() {
      dbg.log('#socetIO > main listeners are triggered');
      socket.on('tstEmitServer', function (data) {
          //alert(data)
          console.warn(55, data);
      });
      socket.emit('tstEmitClient', 'hallo from Client');

    }
  }
})();
