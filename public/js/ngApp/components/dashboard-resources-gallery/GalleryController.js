(function () {
  'use strict';

  angular.
    module('KliikoApp').
    controller('GalleryController', GalleryController);

  GalleryController.$inject = ['dbg', '$q', 'GalleryServices', '$modal', '$scope', 'domServices', '$ocLazyLoad','$injector', 'angularConfirm', 'messenger', 'Upload', 'globalSettings'];
  function GalleryController(dbg, $q, GalleryServices, $modal, $scope, domServices, $ocLazyLoad,$injector,  angularConfirm, messenger, Upload, globalSettings){
    dbg.log2('#GalleryController  started');
    initList();

    $scope.newResource = {};
    $scope.dataForValidation = {};
    $scope.idsForAction = [];
    $scope.action = "";

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
          
        });
      }

      if($scope.action === "download"){
        GalleryServices.downloadResources($scope.idsForAction).then(function(res) {

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

      // $scope.dataForValidation = $scope.newResource;
      // $scope.dataForValidation.file = {
      //   name: $scope.fileTst.name,
      //   size: $scope.fileTst.size,
      //   type: $scope.fileTst.type
      // }

      // console.log($scope.dataForValidation);
      // GalleryServices.validateData($scope.dataForValidation).then(function(res) {
      //   if(res.error){
      //     messenger.error(res.error.name);
      //   }else{
          var deferred = $q.defer();
          console.log(newResource);
          // Upload.upload({
          //   url: globalSettings.restUrl+'/gallery',
          //   method: 'POST',
          //   data: {file: newResource.fileTst, title: newResource.title, type: $scope.newResource.type},
          //   resumeChunkSize: '10KB'
          Upload.http({
            url: globalSettings.restUrl+'/gallery',
            headers : {
              'Content-Type': newResource.fileTst.type
            },
            data: newResource.fileTst
          }).then(
            function(res) {
              if (res.data && res.data.error) {
                dbg.log2('#bannerMessagesService > upload > error ', res.data.error);
                deferred.reject(res.data.error);
                return deferred.promise;
              }

              dbg.log2('#bannerMessagesService > upload > success ', res);
              console.warn(currentBannerType)
              if (currentBannerType) setMainBannerForPage(currentBannerType);

              deferred.resolve();
            },
            function(err) {
              dbg.log2('#bannerMessagesService > upload > error ', err);
              deferred.reject( {status:err.status, statusText: err.statusText})
            },
            function(evt) {}
          );

          return deferred.promise;

          // GalleryServices.uploadResource($scope.fileTst).then(function(res) {
          //   if(res.errors){
          //     messenger.error(res.errors);
          //   }else{
          //     messenger.error("Successfully uploaded a new resource.");
          //   }
          // });
      //   };
      // });
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
