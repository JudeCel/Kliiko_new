(function () {
  'use strict';

  angular.module('infoMessenger', []).
    factory('infoMessenger', infoMessengerFactory);

  infoMessengerFactory.$inject = [];
  function infoMessengerFactory()  {

    var messengerPublicMethods = {};
    messengerPublicMethods.message = message;
    return messengerPublicMethods;

    var element = null;

    function message(message) {
      if (!message) {
        console.warn('No message provided');
        return;
      }

      initMessage();
      hideMessage(true, function() {
        showMessage(message, function() {
          hideMessage(false);
        });
      });
    }

    function initMessage(message) {
      element = jQuery("body > #infoMessage");
      if (element.length == 0) {
        jQuery('body').append('<div id="infoMessage" class="hidden"></div>');
        element = jQuery("body > #infoMessage");
      }
    }

    function showMessage(message, callback) {
      element.text(message);
      show();
      element.addClass("animated fadeInDown");
      if (callback) {
        setTimeout(callback, 3000);
      }
    }

    function show() {
      element.removeClass("hidden");
    }

    function hide() {
      if (!element.hasClass("hidden")) {
        element.addClass("hidden");
      }
      element.removeClass('animated fadeInDown fadeOutUp');
      element.text("");
    }

    function hideMessage(immediately, callback) {
      if (immediately) {
        hide();
        if (callback) {
          callback();
        }
      } else {
        element.removeClass('fadeInDown').addClass('fadeOutUp');
        setTimeout(function() { 
          hide();
          if (callback) {
            callback();
          }
        }, 1000);
      }
    }

  }

})();
