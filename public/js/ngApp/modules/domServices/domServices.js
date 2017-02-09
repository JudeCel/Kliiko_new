(function () {
  'use strict';

  angular.module('domServices', [])
    .factory('domServices', domServicesFactory);

  domServicesFactory.$inject = ['dbg', '$rootScope'];
  function domServicesFactory(dbg, $rootScope) {

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
     * @param [force] {boolean}
     */
    function handleModalActions(modalId, close, force) {
      if (force) {
        $('body .modal.fade:visible').modal('hide');
        return
      }

      if(close) {
        if(typeof close === 'function') {
          jQuery('#' + modalId).on('hidden.bs.modal', close);
        }
        jQuery('#' + modalId).modal('hide');
      } else {
        var id, modals = $('body .modal.fade:visible');
        if(modals.length) {
          id = modals[0].id;
          if(modalId != id) {
            handleModalActions(id, true);
          }
        }

        if(modalId != id) {
          var modal = jQuery('#' + modalId);
          if (modal.length) {
            modal.modal('show');
          }else{
            console.error("modal window not found with id: ", modalId, " check includes and modal window id")
          }
        }
      }
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
