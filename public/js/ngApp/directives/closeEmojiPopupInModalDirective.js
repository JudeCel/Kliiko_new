angular
    .module('KliikoApp')
    .directive('closeEmojiPopupInModal', closeEmojiPopupInModal);

function closeEmojiPopupInModal() {
    var directive = {
        restrict: 'A',
        link : function(scope, element, attrs) {
          var modalWindowSelector = "#" + attrs.closeEmojiPopupInModal;
          var modalWindow = $(modalWindowSelector);
          modalWindow.on('hidden.bs.modal', function() {
            closeEmojiPopup(modalWindow);
          });
        }
    };

    return directive;

    function closeEmojiPopup(modalWindow) {
      var emojiPopup = modalWindow.find("div[popover-template-popup]");
      if (emojiPopup.length != 0) {
        modalWindow.find(".form-group > span > .emoji-picker").click();
      }
    }
}
