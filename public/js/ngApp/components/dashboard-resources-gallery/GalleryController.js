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
    };

    $scope.submitForm = function() {
      dbg.yell($scope.fileTst)

      $scope.params = { uploadType: $scope.uploadType, 
                        file: {
                          name: $scope.fileTst.name,
                          size: $scope.fileTst.size,
                          type: $scope.fileTst.type
                        }
                      }

      GalleryServices.uploadResource($scope.params).then(function(res) {
        console.log("***************************************************")
        console.log(res)
        console.log("***************************************************")
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
