angular
    .module('KliikoApp')
    .directive('emojiPickerHelper', emojiPickerHelper);

function emojiPickerHelper() {
    var directive = {
        restrict: 'A',
        link : function(scope, element, attrs) {
          var modalWindowSelector = "#" + attrs.closeEmojiPopupInModal;
          var modalWindow = $(modalWindowSelector);
          var topicBoardSelector = "#" + attrs.emojiFocusTo;
          var topicBoard = $(topicBoardSelector);

          modalWindow.on('hidden.bs.modal', function() {
            closeEmojiPopup(modalWindow);
          });

          element.on('click', function() {
            focusTo(topicBoard, scope);
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

    function focusTo(topicBoard, scope) {
      scope.$apply();
      var textArea = topicBoard[0];
      textArea.focus();
      textArea.selectionStart = textArea.selectionEnd = textArea.value.length;
    }
}
