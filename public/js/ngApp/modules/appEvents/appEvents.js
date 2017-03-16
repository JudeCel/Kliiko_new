(function () {
  'use strict';

  angular.module('KliikoApp.appEvents', []).factory('appEvents', appEventsFactory);

  appEventsFactory.$inject = ['dbg', '$rootScope'];
  function appEventsFactory(dbg, $rootScope) {

    var vm = this;
    vm.addEventListener = addEventListener;
    vm.dispatchEvent = dispatchEvent;
    vm.events = {
      contactDetailsUpdated: "ContactDetailsUpdated",
      contactUpdated: "contactUpdated"
    }
    vm.registeredEvents = {};
    init();
    return vm;

    function addEventListener(name, func) {
      if (!vm.registeredEvents[name]) {
        vm.registeredEvents[name] = new Event(name);
      }
      vm.registeredEvents[name].callbacks.push(func);
    }
    
    function dispatchEvent(name) {
      if (vm.registeredEvents[name]) {
        vm.registeredEvents[name].callbacks.forEach(function(callback){
          dbg.log2('Event function call for "' + name + '"');
          callback();
        });
      }
    }

    function init() {
      $rootScope.$on('$stateChangeStart',  function(){
        vm.registeredEvents = {};
      });
    }

    function Event(name) {
      this.name = name;
      this.callbacks = [];
    }

  }
})();
