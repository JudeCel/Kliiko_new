angular.module('KliikoApp').factory('socket', socket);
socket.$inject = ['$rootScope', 'globalSettings', '$window'];
angular.module('KliikoApp.Root').factory('socket', socket);

function socket($rootScope, globalSettings, $window) {
  var socket = new Phoenix.Socket(globalSettings.socketServerUrl, {
    params: {
      token: $window.localStorage.getItem("jwtToken")
    },
    // logger: function(kind, msg, data) { console.log(kind +":"+ msg +":",  data) },
  });
  var channel = null;

  socket.onError( function(event){
    console.error(event);
  });

  if (!socket.isConnected()) {
    socket.connect();
  }

  return {
    sessionsBuilderChannel: function (scope, sessionId, callback) {

      if (!channel) {
        scope.$on("$destroy", function handleDestroyEvent() {
          console.log("$destroy")
          channel = null;
        });
        channel = socket.channel("sessionsBuilder:" + sessionId);
      }
      if (channel.state != 'joined') {
        channel.join();
      }
      callback(channel);
    }
  };
}
