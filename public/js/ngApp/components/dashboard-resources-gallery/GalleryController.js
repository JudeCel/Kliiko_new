(function () {
  'use strict';

  angular.
    module('KliikoApp').
    controller('GalleryController', GalleryController);

  GalleryController.$inject = ['dbg', 'GalleryServices', '$modal', '$scope', 'domServices', '$ocLazyLoad','$injector', 'angularConfirm', 'messenger'];
  function GalleryController(dbg, GalleryServices, $modal, $scope, domServices, $ocLazyLoad,$injector,  angularConfirm, messenger){
    dbg.log2('#GalleryController  started');
    var vm = this;

    $scope.uploadTst = function() {
      dbg.yell($scope.fileTst)
    }

    initList();

    function initList() {
      GalleryServices.getResources().then(function(res) {

      });
    }

    $scope.downloadResources = function(){
      GalleryServices.downloadResources().then(function(res) {

      });
    }

    $scope.deleteResources = function(){
      GalleryServices.deleteResources().then(function(res) {

      });
    }

    $scope.uploadResourceForm = function(uploadType) {
      $scope.uploadType = uploadType;
      $scope.uploadTypeForTitle = uploadTypeForTitle(uploadType);

      domServices.modal('uploadTST')
      //$scope.modalInstance = $modal.open({
      //  templateUrl: 'js/ngApp/components/dashboard-resources-gallery/modal.html',
      //  windowTemplateUrl: 'js/ngApp/components/dashboard-resources-gallery/window.html',
      //  controller: UploadResourceModalController,
      //  resolve: {
      //    data: function() {
      //      return { uploadType: uploadType };
      //    }
      //  }
      //});
    };

    $scope.submitForm = function() {
      $scope.params = {uploadType: $scope.uploadType, file: $scope.fileTst}
      dbg.yell($scope.params)

    };

    function uploadTypeForTitle(uploadType) {
      if(uploadType === "brandLogo"){
        return "brand logo";
      }

      if(uploadType === "youtubeUrl"){
        return "youtube";
      }

      return uploadType;
    }
  }

})();
