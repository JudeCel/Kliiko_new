(function () {
  'use strict';

  angular.module('KliikoApp').controller('PromotionCodeController', PromotionCodeController);
  PromotionCodeController.$inject = ['dbg', 'PromotionCodeServices', '$modal', '$scope', '$rootScope', '$filter', '$timeout'];

  function PromotionCodeController(dbg, PromotionCodeServices, $modal, $scope, $rootScope, $filter, $timeout) {
    dbg.log2('#PromotionCodeController started');

    $scope.promos = {};
    init();

    function init() {
      PromotionCodeServices.getPromotionCodes().then(function(res) {
        $scope.promos = res.promos;
        $scope.discountTypes = res.discountTypes;
        $scope.dateFormat = res.dateFormat;
        dbg.log2('#PromotionCodeController > getPromotionCodes > res ', res.promos, res.discountTypes);
      });
    };

    $scope.openModal = function(promo) {
      $scope.modalInstance = $modal.open({
        templateUrl: 'js/ngApp/components/dashboard-accountProfile-promotionCode/modal.html',
        windowTemplateUrl: 'js/ngApp/components/dashboard-accountProfile-promotionCode/window.html',
        controller: PromotionCodeModalController,
        resolve: {
          discountTypes: function() {
            return $scope.discountTypes;
          },
          promo: function() {
            return promo;
          },
          dateFormat: function() {
            return $scope.dateFormat;
          }
        }
      });
    };

    $scope.removePromoCode = function(promo) {
      PromotionCodeServices.removePromoCode(promo.id).then(function(res) {
        dbg.log2('#PromotionCodeController > removePromoCode > res ', res);
        if(res.error) {
          setError($scope, res.error);
        }
        else {
          setMessage($scope, res.message);
          var index = $scope.promos.indexOf(promo);
          $scope.promos.splice(index, 1);
        }
      });
    };

    $scope.discountTypeString = function(promo) {
      if(promo.discountType == 'value') {
        return '$';
      }
      else {
        return '%';
      }
    };

    function setMessage(scope, message) {
      if(message) {
        scope.error = null;
      }

      scope.message = message;
    };

    function setError(scope, error) {
      if(error) {
        scope.message = null;
      }

      scope.error = error;
    };

    $rootScope.$watch('updatedPromotionCode', function(data) {
      if($rootScope.updatedPromotionCode) {
        var index = $filter('findPositionById')(data.promo, $scope.promos);
        if(index > -1) {
          $scope.promos.splice(index, 1, data.promo);
        }

        setMessage($scope, data.message);
        $rootScope.updatedPromotionCode = null;
      }
    });

    $rootScope.$watch('addedNewPromotionCode', function(data) {
      if($rootScope.addedNewPromotionCode) {
        if($filter('findPositionById')(data.promo, $scope.promos) == -1) {
          $scope.promos.push(data.promo);
        }

        setMessage($scope, data.message);
        $rootScope.addedNewPromotionCode = null;
      }
    });

    $scope.$watch('message', function(data) {
      if($scope.message) {
        $timeout(function() {
          setMessage($scope, null);
        }, 2000);
      }
    });

    $scope.$watch('error', function(data) {
      if($scope.error) {
        $timeout(function() {
          setError($scope, null);
        }, 2000);
      }
    });
  };

  angular.module('KliikoApp').controller('PromotionCodeModalController', PromotionCodeModalController);
  PromotionCodeModalController.$inject = ['dbg', '$scope', '$uibModalInstance', 'PromotionCodeServices', '$rootScope', 'discountTypes', 'promo', 'dateFormat'];

  function PromotionCodeModalController(dbg, $scope, $uibModalInstance, PromotionCodeServices, $rootScope, discountTypes, promo, dateFormat) {
    dbg.log2('#PromotionCodeModalController started');

    $scope.promo = {};
    $scope.errors = {};
    $scope.sendingData = false;

    $scope.discountTypes = discountTypes;
    if(promo) {
      angular.copy(promo, $scope.promo);
      $scope.editablePromo = true;
    }

    $scope.promo.discountType = $scope.promo.discountType || discountTypes[0];
    $scope.promo.startDate = new Date();

    $scope.dateOptions = {
      formatYear: 'yy',
      startingDay: 1
    };

    $scope.minDate = new Date();
    $scope.maxDate = new Date(new Date($scope.minDate).setYear($scope.minDate.getFullYear() + 5));
    $scope.format = dateFormat;

    $scope.status = {
      startDate: false,
      endDate: false
    };

    $scope.openCalendar = function(date, $event) {
      $scope.status[date] = true;
    };

    $scope.submitForm = function() {
      if($scope.sendingData) return;

      $scope.sendingData = true;
      if($scope.editablePromo) {
        dbg.log2('#PromotionCodeModalController > edit > submitForm', $scope.promo);
        PromotionCodeServices.updatePromoCode($scope.promo).then(function(res) {
          $scope.sendingData = false;
          if(res.error) {
            $scope.errors = res.error;
          }
          else {
            $rootScope.updatedPromotionCode = { promo: res.promo, message: res.message };
            $uibModalInstance.dismiss('cancel');
          }
        });
      }
      else {
        dbg.log2('#PromotionCodeModalController > new > submitForm', $scope.promo);
        PromotionCodeServices.createPromoCode($scope.promo).then(function(res) {
          $scope.sendingData = false;
          if(res.error) {
            $scope.errors = res.error;
          }
          else {
            $rootScope.addedNewPromotionCode = { promo: res.promo, message: res.message };
            $uibModalInstance.dismiss('cancel');
          }
        });
      }
    };

    $scope.shouldBeSelected = function(optionType, promoType) {
      return optionType == promoType;
    };

    $scope.$watch('promo.discountType', function(data) {
      $scope.selectedOptionValue = (data == 'value');
    });

    $scope.closeModal = function() {
      $scope.promo = {};
      $scope.errors = {};
      $uibModalInstance.dismiss('cancel');
    };
  };
})();
