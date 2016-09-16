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

      var template = "<div class='media'> \
        <div class='media-left media-middle'></div> \
        <div class='media-body'></div> \
        <div class='media-right'></div> \
      </div>";

      self.id = 'msgId' + new Date().getTime();
      self.tpl = '<div id="'+self.id+'" class="message animated fadeInDown '+ type +'">'+template+'</div>';
      self.flash = function(delay) {
        var parent = jQuery('#messenger-area');

        if(parent.children().length >= 5) {
          var child = parent.children().last();
          child.detach();
          showMsg(parent);
        }
        else {
          showMsg(parent);
        }

        function showMsg(parent) {
          var delay = delay || 3000;
          // show
          parent.prepend(self.tpl);
          self.$el = jQuery('#'+self.id);
          self.$el.find('.media .media-body').prepend(message);

          // and hide
          if(type == 'error') {
            self.$el.find('.media .media-left').prepend('<span class="glyphicon glyphicon-alert margin-right-5 margin-left-5"></span>');
            self.$el.find('.media .media-right').prepend('<span id="button-'+self.id+'" class="pull-right cursor-pointer glyphicon glyphicon-remove"></span>');
            self.$button = jQuery('#button-'+self.id);
            self.$button.click(function() {
              self.$el.detach();
            });
          }

          setTimeout(function() {
            self.$el.removeClass('fadeInDown').addClass('fadeOutDown');
            setTimeout(function() { self.$el.detach() }, 2000);
          }, delay);
        }
      };

      function parseMessage(rawMessage) {
        var output = '';
        if ( typeof(rawMessage) === 'string') output = escapeHtmlToString(rawMessage);
        if ( angular.isObject(rawMessage) ) {
          for (var property in rawMessage) {
            var message = rawMessage[property];
            if(Array.isArray(message)) {
              for (var i in message) {
                output += escapeHtmlToString(property + ' ' + message[i]) +'<br/> ';
              }
            }
            else {
              output += escapeHtmlToString(rawMessage[property]) +'<br/> ';
            }
          }
        }

        return output;
      }
    };

    var shouldSkip = false;
    var messengerPublicMethods = {};

    messengerPublicMethods.ok = ok;
    messengerPublicMethods.error = error;
    messengerPublicMethods.clear = clear;
    messengerPublicMethods.changeSkip = changeSkip;

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

    function clear() {
      if(!shouldSkip) {
        jQuery('#messenger-area').empty();
      }
    }

    function changeSkip(value) {
      shouldSkip = value;
    }

  }




})();
