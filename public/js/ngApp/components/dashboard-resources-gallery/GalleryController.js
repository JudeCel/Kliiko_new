(function () {
  'use strict';

  angular.
    module('KliikoApp').
    controller('GalleryController', GalleryController);

  GalleryController.$inject = ['dbg', '$q', 'GalleryServices', '$modal', 
                               '$scope', 'domServices', 'messenger', 
                               'Upload', 'globalSettings', '$sce'];

  function GalleryController(dbg, $q, GalleryServices, $modal, $scope, domServices, messenger, Upload, globalSettings, $sce){
    dbg.log2('#GalleryController  started');
    initList();

    function initList() {
      GalleryServices.getResources().then(function(res) {
        $scope.resources = res.data;
        $scope.totalResourceCount = $scope.resources.length;
      });
    }

    $scope.newResource = {};
    $scope.dataForValidation = {};
    $scope.idsForAction = [];
    $scope.action = "";

    $scope.renderHtml = function (htmlCode) {
      return $sce.trustAsHtml(htmlCode);
    };


    $scope.resourcesSelected = function(id) {
      if($scope.idsForAction.indexOf(id) == -1){
        $scope.idsForAction.push(id);
      }else if($scope.idsForAction.indexOf(id) !== -1){
        $scope.idsForAction.splice($scope.idsForAction.indexOf(id), 1);
      }
    }

    $scope.uploadResourceForm = function(uploadType) {
      $scope.newResource.type = uploadType;
      $scope.uploadTypeForTitle = uploadTypeForTitle(uploadType);

      domServices.modal('uploadTST');
    };

    $scope.submitForm = function(newResource) {
      if(newResource.type == "youtubeUrl"){
        saveYoutube(newResource);
      }else{
        saveResource(newResource);
      }
    };

    function saveYoutube(newResource){
      var resourceParams = {
        userId: null,
        title: newResource.title,
        text: newResource.youtubeUrl
      };
      
      GalleryServices.saveYoutubeUrl(resourceParams).then(function(res) {
        if(res.error){
          messenger.error(res.error);
        }else{
          initList();
          $scope.newResource = {};
          cancel();
          messenger.ok("Resource was successfully created.");
        }
      })
    }

    function saveResource(newResource){
      var resourceParams = {
        userId: null,
        title: newResource.title,
        type: newResource.type,
        text: $scope.newResource.fileTst.name,
        file: newResource.fileTst
      };

      GalleryServices.createResource(resourceParams).then(function(res) {
        if(res.error){
          messenger.ok(res.error);
        }else{
           GalleryServices.postuploadData(resourceParams).then(function(res) {
            if(res.error){
              messenger.error(res.error);
            }else{
              initList();
              $scope.newResource = {};
              cancel()
              messenger.ok("Resource was sucessfully created.");
            }
          })
        }
      })
    }

    function uploadTypeForTitle(uploadType) {
      if(uploadType == "brandLogo"){
        return "brand logo";
      }
      if(uploadType == "youtubeUrl"){
        return "youtube";
      }
      return uploadType;
    }

    function cancel(){
      domServices.modal('uploadTST', 'close');
    }
   
    $scope.isAll = false;
    $scope.selectAllResources = function() {
      if($scope.isAll) {
        angular.forEach($scope.resources, function(resource){
          resource.checked = false;
        });

        $scope.idsForAction = [];
        $scope.isAll = false; 
      } else {
        angular.forEach($scope.resources, function(resource){
          resource.checked = true;
          $scope.idsForAction.push(resource.id);
        });
      
        $scope.isAll = true;  
      }
    };

    $scope.actionDelete = function(){
      $scope.action = "delete";
    }

    $scope.actionDownload = function(){
      $scope.action = "download";
    }

    $scope.submitIdsForMassAction = function() {
      if($scope.action === "delete"){
        $scope.deleteResources($scope.idsForAction);
      }

      if($scope.action === "download"){
        $scope.downloadResources($scope.idsForAction);
      }
    }

    $scope.deleteResources = function(ids) {
      GalleryServices.deleteResources({resource_id: ids}).then(function(res) {
        if(res.error){
          messenger.error(res.error);
        }else{
          initList()
          $scope.idsForAction = [];
          messenger.ok("Your selected resource(s) was successfully deleted.");
        }
      });
    }

    $scope.downloadResources = function(ids) {
      GalleryServices.downloadResources({resource_id: ids}).then(function(res) {
        if(res.error){
          messenger.error("Something went wrong, please try again later.");
        }else{
          window.location.assign('/chat_room/uploads/' + res.fileName);
        }
      })
    }
  }
})();
