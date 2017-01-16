(function () {
  'use strict';

  angular.module('KliikoApp.propertyDisabler', []).factory('propertyDisabler', propertyDisablerFactory);

  propertyDisablerFactory.$inject = [];
  function propertyDisablerFactory() {
    
    var vm = this;
    vm.isPropertyDisabled = isPropertyDisabled;
    vm.disablePropertyChanges = disablePropertyChanges;
    vm.enablePropertyChanges = enablePropertyChanges;
    vm.disabledProperties = [];
    return vm;
    
    function setPropertyElementEnabled(propertyName, enabled) {
      var elementSelector = "*[data-property='" + propertyName + "']";
      var elementAndAllInsideSelector = elementSelector + ", " + elementSelector + " *";
      var value = enabled ? null : -1;
      jQuery(elementAndAllInsideSelector).each(function() { 
        $(this).attr('tabindex', value); 
      });
      var classValue = jQuery.browser.msie && jQuery.browser.version <= 10 ? "property-disabled-ie" : "property-disabled";
      jQuery(elementSelector).each(function() { 
        if (enabled) {
          $(this).removeClass(classValue); 
        } else {
          $(this).addClass(classValue); 
        }
      });
    }

    function disablePropertyChanges(propertyName) {
      if (vm.disabledProperties.indexOf(propertyName) == -1) {
        vm.disabledProperties.push(propertyName);
        setPropertyElementEnabled(propertyName, false);
      }
    }

    function enablePropertyChanges(propertyName) {
      var index = vm.disabledProperties.indexOf(propertyName);
      if (index != -1) {
        vm.disabledProperties.splice(index, 1);
        setPropertyElementEnabled(propertyName, true);
      }
    }

    function isPropertyDisabled(propertyName) {
      return vm.disabledProperties.indexOf(propertyName) != -1;
    }

  }
})();
