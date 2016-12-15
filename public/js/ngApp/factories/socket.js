// angular.module('KliikoApp').factory('socket', socket);
// socket.$inject = ['$rootScope', 'globalSettings', 'fileUploader'];
// angular.module('KliikoApp.Root').factory('socket', socket);
//
// function socket($rootScope, globalSettings, fileUploader) {
//   var socket = new Phoenix.Socket(globalSettings.socketServerUrl, {
//     params: {
//       token: fileUploader.token
//     },
//     // logger: function(kind, msg, data) { console.log(kind +":"+ msg +":",  data) },
//   });
//
//   return {
//     on: function (eventName, callback) {
//       socket.on(eventName, function () {
//         var args = arguments;
//         $rootScope.$apply(function () {
//           callback.apply(socket, args);
//         });
//       });
//     },
//     emit: function (eventName, data, callback) {
//       socket.emit(eventName, data, function () {
//         var args = arguments;
//         $rootScope.$apply(function () {
//           if (callback) {
//             callback.apply(socket, args);
//           }
//         });
//       })
//     }
//   };
// }


// function socketConnection(self) {
//   self.socket = new Phoenix.Socket(globalSettings.socketServerUrl, {
//     params: {
//       token: fileUploader.token
//     },
//     // logger: function(kind, msg, data) { console.log(kind +":"+ msg +":",  data) },
//   });
//
//   self.socket.onError( function(event){
//     console.error(event);
//   });
//
//   if (self.id) {
//     var channel = self.socket.channel("sessionsBuilder:" + self.id);
//     if (channel.state != 'joined') {
//
//       channel.on("inviteUpdate", function(resp) {
//         if (resp.role == 'participant' ) {
//           updateInvite(self.steps, resp)
//         }else {
//
//         }
//       });
//       channel.on("inviteDelete", function(resp) {
//         removeInvite(self.steps, resp);
//       });
//
//       channel.join();
//     }
//     self.socket.connect();
//   }
// }
