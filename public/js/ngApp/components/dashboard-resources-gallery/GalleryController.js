(function () {
  'use strict';

  angular.
    module('KliikoApp').
    controller('GalleryController', GalleryController);

  GalleryController.$inject = ['dbg', 'GalleryServices', '$modal', '$scope', 'domServices', '$ocLazyLoad','$injector', 'angularConfirm', 'messenger'];
  function GalleryController(dbg, GalleryServices, $modal, $scope, domServices, $ocLazyLoad,$injector,  angularConfirm, messenger){
    dbg.log2('#GalleryController  started');
    initList();

    $scope.newResource = {};

    $scope.uploadTst = function() {
      dbg.yell($scope.fileTst)
    }

    function initList() {
      GalleryServices.getResources().then(function(res) {
        $scope.resources = res.data;
        $scope.totalResourceCount = $scope.resources.length;
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
      $scope.newResource.type = uploadType;
      $scope.uploadTypeForTitle = uploadTypeForTitle(uploadType);

      domServices.modal('uploadTST')
    };

    $scope.submitForm = function(newResource) {

      $scope.newResource.file = {
        name: $scope.fileTst.name,
        size: $scope.fileTst.size,
        type: $scope.fileTst.type
      }

      GalleryServices.uploadResource(newResource).then(function(res) {
        dbg.yell(res)
      });
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
