(function () {
  'use strict';

  angular.module('domServices', [])
    .factory('domServices', domServicesFactory);

  domServicesFactory.$inject = ['dbg'];
  function domServicesFactory(dbg) {

    var domServicesPublicMethods = {};
    domServicesPublicMethods.modal = handleModalActions;
    domServicesPublicMethods.shakeClass = shakeClass;
    domServicesPublicMethods.showFader = showFader;
    domServicesPublicMethods.hideFader = hideFader;


    return domServicesPublicMethods;

    /**
     * Open or close selected @modalId modal window
     * @param modalId {string}
     * @param [close] {boolean}
     */
    function handleModalActions(modalId, close) {
      close
        ? jQuery('#' + modalId).modal('hide')
        : jQuery('#' + modalId).modal('show');
    }


    /**
     * Append 'animated shake' classes to given element to attract visual attention
     * requires https://daneden.github.io/animate.css/
     * @param className {string} = 'someClass'
     */
    function shakeClass(className) {
      if (!className) {
        dbg.warn('#domServices > shakeClass > @className is missed. Won\'t apply');
        return;
      }
      var $el = $('.' + className);
      $el.addClass('animated shake');
      setTimeout(function () {
        $el.removeClass('animated shake')
      }, 1000);
    }

    function showFader() { jQuery('#null').modal('show') }
    function hideFader() { jQuery('#null').modal('hide') }

  }


})();
