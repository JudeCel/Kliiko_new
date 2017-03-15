(function () {
  'use strict';

  angular.module('KliikoApp.appEvents', []).factory('appEvents', appEventsFactory);

  appEventsFactory.$inject = ['dbg', '$rootScope'];
  function appEventsFactory(dbg, $rootScope) {

    var vm = this;
    vm.addEventListener = addEventListener;
    vm.dispatchEvent = dispatchEvent;
    vm.events = {
      contactDetailsUpdated: "ContactDetailsUpdated"
    }
    init();
    return vm;

    function getElement(name, initNew) {
      var id = "appEventElement" + name;
      var element = document.getElementById(id);
      if (initNew) {
        if (element) {
          document.body.removeChild(element);
        }
        element = document.createElement("div");
        element.id = id;
        document.body.appendChild(element);
      }
      return element;
    }

    function addEventListener(name, func) {
      var element = getElement(name, true);
      element.addEventListener(name, function(e) {
        dbg.log2('Event function call for "' + name + '"');
        func();
      });
    }
    
    function dispatchEvent(name) {
      var element = getElement(name, false);
      if (element) {
        var event = new CustomEvent(name);
        element.dispatchEvent(event);
      }
    }

    function init() {
      $rootScope.$on('$stateChangeStart',  function(){
        var elements = document.querySelectorAll("div[id^='appEventElement']");
        for (var i=0; i<elements.length; i++) {
          document.body.removeChild(elements[i]);
        }
      });
    }

  }
})();
