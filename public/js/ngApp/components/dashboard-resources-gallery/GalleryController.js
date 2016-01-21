(function () {
  'use strict';

  angular.
    module('KliikoApp').
    controller('GalleryController', GalleryController);

  GalleryController.$inject = ['dbg', '$q', 'GalleryServices', '$modal', '$scope', 'domServices','$injector', 'messenger', 'Upload', 'globalSettings'];
  function GalleryController(dbg, $q, GalleryServices, $modal, $scope, domServices,$injector, messenger, Upload, globalSettings){
    dbg.log2('#GalleryController  started');
    initList();

    // $scope.viewStyle = $cookies.get('viewStyle');

    $scope.newResource = {};
    $scope.dataForValidation = {};
    $scope.idsForAction = [];
    $scope.action = "";

    $scope.setView = function(style) {
      // $cookies.put('viewStyle', style);
      // dbg.yell($sessionStorage.SessionMessage)
    }

    $scope.resourcesSelected = function(id) {
      $scope.idsForAction.push(id);
    }

    $scope.actionDelete = function(){
      $scope.action = "delete";
    }

    $scope.actionDownload = function(){
      $scope.action = "download";
    }

    $scope.submitIdsForMassAction = function() {
      if($scope.action === "delete"){
        GalleryServices.deleteResources({id: $scope.idsForAction}).then(function(res) {
          if(res.error){
            // TODO
          }else{
            $scope.idsForAction = [];
            initList()
          }
        });
      }

      if($scope.action === "download"){
        GalleryServices.downloadResources({id: $scope.idsForAction}).then(function(res) {
          if(res.error){
            // TODO
          }else{
            $scope.idsForAction = [];
          }
        });
      }
    }

    $scope.uploadTst = function() {
      dbg.yell($scope.newResource.fileTst)
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
      let deferred = $q.defer();
      let resourceParams = {
        // topicId: topicId,
        userId: null,
        title: newResource.title,
        type: newResource.type,
        text: $scope.newResource.fileTst.name
      };
      // console.log(GalleryServices.createResource);
      GalleryServices.createResource(resourceParams).then(function(res) {
        
      })

      //   Upload.upload({
      //     url: globalSettings.restUrl+'/gallery',
      //     method: 'POST',
      //     data: {uploadedfile: newResource.fileTst}
      //   }).then(
      //     function(res) {

      //       deferred.resolve();
      //     },
      //     function(err) {
      //       deferred.reject( {status:err.status, statusText: err.statusText})
      //     }
      //   );
      // return deferred.promise;
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
