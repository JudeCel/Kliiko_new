/**
 * Messenger Module
 * Usage example:
 *  messenger.ok('Data Saved');
 *  messenger.error('Error: input fields are invalid');
 */
(function () {
  'use strict';

  angular.module('messenger', []).
    factory('messenger', messengerFactory);

  messengerFactory.$inject = [];
  function messengerFactory()  {

    var entityMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': '&quot;',
      "'": '&#39;',
      "/": '&#x2F;'
    };

    function escapeHtmlToString(str) {
      return String(str).replace(/[&<>"'\/]/g, function (s) {
        return entityMap[s];
      });
    }

    // Init. Timeout is to bypass 'undefined' error
    setTimeout(function() {
      jQuery('body').prepend('<div id="messenger-area"></div>');
    }, 10);

    /**
     * Generate message in default "messenger-area" with given text
     * @param type {string} "ok" or "error"
     * @param message {string || html}
     * @param [delay] {int} default: 3000
     * @constructor
     */
    var Message = function(type, message, delay) {
      var self = this;

      var type = type || 'default';

      var message = parseMessage(message);

      self.id = 'msgId' + new Date().getTime();
      self.tpl = '<div id="'+self.id+'" class="message animated fadeInDown '+ type +'">'+message+'</div>';
      self.flash = function(delay) {
        var delay = delay || 3000;
        // show
        jQuery('#messenger-area').prepend(self.tpl);
        self.$el = jQuery('#'+self.id);

        // and hide
        if(type != 'error') {
          setTimeout(function() {
            self.$el.removeClass('fadeInDown').addClass('fadeOutDown');
            setTimeout(function() { self.$el.detach() }, 2000);
          }, delay);
        }
        else {
          var closeButton = '<div id="button-'+self.id+'" class="pull-right cursor-pointer glyphicon glyphicon-remove"></div>';
          self.$el.prepend(closeButton);
          self.$button = jQuery('#button-'+self.id);
          self.$button.click(function() {
            self.$el.detach();
          });
        }
      };

      function parseMessage(rawMessage) {
        var output = '';
        if ( typeof(rawMessage) === 'string') output = escapeHtmlToString(rawMessage);
        if ( angular.isObject(rawMessage) ) {
          for (var property in rawMessage) {
            output += escapeHtmlToString(rawMessage[property]) +'<br/> ';
          }
        }

        return output;
      }
    };

    var messengerPublicMethods = {};

    messengerPublicMethods.ok = ok;
    messengerPublicMethods.error = error;

    return messengerPublicMethods;

    /**
     * Show Ok message
     * @param message {string || html}
     * @param [delay] {int} default is 3000ms
     */
    function ok(message, delay) {
      if (!message) {
        console.warn('NO message provided');
        return;
      }
      var m = new Message('ok', message, delay);
      m.flash(delay);
    }

    /**
     * Show error message
     * @param message {string || html }
     * @param [delay] {int} default is 5000ms
     */
    function error (message, delay) {
      if (!message) {
        console.warn('NO message provided');
        return;
      }

      var delay = delay || 5000;
      var m = new Message('error', message);
      m.flash(delay);
    }


  }




})();
