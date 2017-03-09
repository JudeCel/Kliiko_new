angular
    .module('KliikoApp')
    .directive('multipleDraggingZone', multipleDraggingZone);

function multipleDraggingZone() {
    var directive = {
        restrict: 'A',
        scope: {
          dragInProgress: '=multipleDraggingZone',
          dragAll: '='
        },
        link : function(scope, element, attrs) {
          scope.$watch('dragAll', function() {
            toggleSelectedForDragItems(scope, element);
          });

          scope.$watch('dragInProgress', function() {
            if (scope.dragInProgress) {
              initDraggingOptions(scope, element);
              initDraggingOffsetOptions(scope);

              element.mousemove(function() {
                processDragIfMultipleItemsSelected(scope);
              });
            } else {
              resetTransform(element);
              scope.draggingOptions = {};
            }
          });
        }
    };

    return directive;

    function toggleSelectedForDragItems(scope, element){
      var items = element.children();
      for (var i = 0; i < items.length; i++) {
        var angularElement = angular.element(items[i]);
        var elementScope = angularElement.scope();
        var canBeDragged = elementScope.$eval(angularElement.attr('ng-drag'));
        elementScope.isSelectedForDragging = scope.dragAll && canBeDragged;
      }
    }

    function initDraggingOptions(scope, element) {
      var allItems = element.children();
      var selectedItems = getSelectedItems(allItems);
      var draggingItem = $('.dragging');
      scope.draggingOptions = {
        isSelectedMoreThanOneItem : isSelectedMoreThanOneItem(selectedItems),
        items: allItems,
        draggingItem: draggingItem,
        itemHeight: draggingItem.innerHeight(),
        mainDraggingElementIndex: getMainDraggingElementIndex(allItems),
        selectedItems: selectedItems,
        offsetOptions: []
      };
    }

    function initDraggingOffsetOptions(scope) {
      var processedItems = 0;
      var delta = 1;

      // drag items bottom to main dragging topic
      for (var i = scope.draggingOptions.mainDraggingElementIndex + delta; i < scope.draggingOptions.items.length; i++) {
        if (isSelectedItem(scope.draggingOptions.items.eq(i))) {
          var moves = i - scope.draggingOptions.mainDraggingElementIndex - processedItems - delta;
          processedItems++;
          pushToOffsetOptions(scope, moves, i);
        }
      }

      processedItems = 0;
      // drag items on top of main dragging topic
      for (var i = scope.draggingOptions.mainDraggingElementIndex - delta; i >= 0; i--) {
        if (isSelectedItem(scope.draggingOptions.items.eq(i))) {
          var moves = scope.draggingOptions.mainDraggingElementIndex - i - processedItems - delta;
          moves *= -delta;
          processedItems++;
          pushToOffsetOptions(scope, moves, i);
        }
      }
    }

    function isSelectedMoreThanOneItem(selectedItems) {
      return selectedItems.length > 1;
    }

    function getSelectedItems(items) {
      var selectedItems = [];

      for (var i = 0; i < items.length; i++) {
        if (isSelectedItem(items.eq(i))) {
          selectedItems.push(items[i]);
        }
      }

      return selectedItems;
    }

    function getMainDraggingElementIndex(items) {
      for (var i = 0; i < items.length; i++) {
        if (items.eq(i).hasClass('dragging')) {
          return i;
        }
      }
    }

    function isSelectedItem(item) {
      return angular.element(item).scope().isSelectedForDragging;
    }

    function pushToOffsetOptions(scope, moves, index) {
      var offset = scope.draggingOptions.itemHeight * moves;
      scope.draggingOptions.offsetOptions.push({
        offset: offset,
        index: index
      });
    }

    function processDragIfMultipleItemsSelected(scope) {
      if (scope.draggingOptions.isSelectedMoreThanOneItem) {
        var matrix = getTransformMatrix(scope.draggingOptions.draggingItem);
        var initialTransformMatrixTop = matrix[matrix.length - 1];
        var matrixUnchagedPart = matrix[0] + '(' + matrix[1] + ', ' + matrix[2] + ', ' + matrix[3] + ', ' + matrix[4] + ', ' + matrix[5] + ', ';
        var offsetOptions = scope.draggingOptions.offsetOptions;

        for (var i = 0; i < offsetOptions.length; i++) {
          var adjustedTransformMatrixTop = initialTransformMatrixTop - offsetOptions[i].offset;
          var css = {
            'transform': matrixUnchagedPart + adjustedTransformMatrixTop + ')',
            'z-index': 99999
          };

          scope.draggingOptions.items.eq(offsetOptions[i].index).css(css);
        }
      }
    }

    function getTransformMatrix(draggingItem) {
      var transform = draggingItem.css('transform');
      return transform.replace(')', '').split(/,\s|\(/);
    }

    function resetTransform(element) {
      var items = element.children();
      var css = {
        'transform' : 'none',
        'z-index' : '1'
      };

      for (var i = 0; i < items.length; i++) {
        items.eq(i).css(css);
      }
    }
}

angular
    .module('KliikoApp')
    .directive('multipleDraggingItem', multipleDraggingItem);

function multipleDraggingItem() {
    var directive = {
        restrict: 'A',
        scope: true,
        link: function(scope, element, attrs) {
          scope.isSelectedForDragging = false;

          element.click(function(){
            scope.isSelectedForDragging = scope.$apply(attrs.multipleDraggingItem);
          });
        }
    };

    return directive;
}
