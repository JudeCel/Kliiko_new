(function () {
  'use strict';

  angular.
    module('KliikoApp').
    controller('GalleryController', GalleryController);

  GalleryController.$inject = ['dbg', '$modal', '$scope', '$rootScope', '$filter', 'angularConfirm', 'messenger'];
  function GalleryController(dbg, $modal, $scope, $rootScope, $filter, angularConfirm, messenger){
    dbg.log2('#GalleryController  started');
    var vm = this;

    initList();

    function initList() {
      // TDODO get the record list
    }

    $scope.uploadResourceForm = function(uploadType) {
      $scope.modalInstance = $modal.open({
        templateUrl: 'js/ngApp/components/dashboard-resources-gallery/modal.html',
        windowTemplateUrl: 'js/ngApp/components/dashboard-resources-gallery/window.html',
        controller: UploadResourceModalController,
        resolve: {
          data: function() {
            return { uploadType: uploadType };
          }
        }
      });
    };
  }

  angular.module('KliikoApp').controller('UploadResourceModalController', UploadResourceModalController);
  UploadResourceModalController.$inject = ['dbg', '$scope', '$uibModalInstance', '$rootScope', 'data'];

  function UploadResourceModalController(dbg, $scope, $uibModalInstance, $rootScope, data) {
    dbg.log2('#UploadResourceModalController started');

    $scope.uploadType = data.uploadType;
    $scope.uploadTypeForTitle = uploadTypeForTitle();
    $scope.errors = {};
    $scope.sendingData = false;

    $scope.submitForm = function() {
      // if($scope.sendingData) return;

      // var params = { accountId: $scope.accountId, userId: $scope.userId, comment: $scope.comment };
      // $scope.sendingData = true;
      // dbg.log2('#UploadResourceModalController > submitForm', params);

      // AccountDatabaseServices.updateAccountUser(params).then(function(res) {
      //   $scope.sendingData = false;
      //   if(res.error) {
      //     $scope.errors = res.error;
      //   }
      //   else {
      //     $rootScope.changedUserComment = { account: res.account, message: res.message };
      //     $uibModalInstance.dismiss('cancel');
      //   }
      // });
    };

    function uploadTypeForTitle() {
      if($scope.uploadType === "brandLogo"){
        return "brand logo";
      }

      if($scope.uploadType === "youtubeUrl"){
        return "youtube";
      }

      return $scope.uploadType;
    }

    $scope.closeModal = function() {
      $scope.errors = {};
      $uibModalInstance.dismiss('cancel');
    };
  };

})();
