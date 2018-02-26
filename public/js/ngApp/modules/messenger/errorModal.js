(function () {
  'use strict';

  angular.module('errorMessenger', []).
    factory('errorMessenger', messengerFactory);

  messengerFactory.$inject = ['messenger', '$confirm'];
  function messengerFactory(messenger, $confirm)  {
    var methods = {};
    methods.showError = function (error) {
      if (error.dialog) {
        $confirm({ title: error.title, text: error.dialog, closeOnly: true });
      } else {
        messenger.error(error);
      }
    }
    return methods;
  }

})();
