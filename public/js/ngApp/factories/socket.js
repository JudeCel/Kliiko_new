angular.module('KliikoApp').factory('socket', socket);
socket.$inject = ['$rootScope', 'globalSettings', 'fileUploader'];
angular.module('KliikoApp.Root').factory('socket', socket);

function socket($rootScope, globalSettings, fileUploader) {
  var socket = new Phoenix.Socket(globalSettings.socketServerUrl, {
    params: {
      token: fileUploader.token
    },
    // logger: function(kind, msg, data) { console.log(kind +":"+ msg +":",  data) },
  });

  socket.onError( function(event){
    console.error(event);
  });

  socket.connect();

  return {
    sessionsBuilderChannel: function (sessionId, callback) {
      var channel = socket.channel("sessionsBuilder:" + sessionId);
      if (channel.state != 'joined') {
        channel.join();
      }
      callback(channel);
    }
  };
}
