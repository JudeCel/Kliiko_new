(function () {
  'use strict';

  angular.
    module('KliikoApp').
    controller('GalleryController', GalleryController);

  GalleryController.$inject = ['dbg', '$q', 'GalleryServices', '$modal', 
                               '$scope', 'domServices','$injector', 'messenger', 
                               'Upload', 'globalSettings', '$http'];

  function GalleryController(dbg, $q, GalleryServices, $modal, $scope, domServices,$injector, messenger, Upload, globalSettings, $http){
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

    $scope.setView = function(style) {
      // $cookies.put('viewStyle', style);
      dbg.yell(style)
    }

    $scope.resourcesSelected = function(id) {
      if($scope.idsForAction.indexOf(id) == -1){
        $scope.idsForAction.push(id);
      }else if($scope.idsForAction.indexOf(id) !== -1){
        $scope.idsForAction.splice($scope.idsForAction.indexOf(id), 1);
      }
    }

    $scope.uploadTst = function() {
      
    }

    $scope.uploadResourceForm = function(uploadType) {
      $scope.newResource.type = uploadType;
      $scope.uploadTypeForTitle = uploadTypeForTitle(uploadType);

      domServices.modal('uploadTST');
    };

    $scope.submitForm = function(newResource) {
      dbg.yell(newResource)
      if(newResource.type == "youtubeUrl"){
        let resourceParams = {
          // topicId: topicId,
          userId: null,
          title: newResource.title,
          text: newResource.youtubeUrl
        };
        
        GalleryServices.saveYoutubeUrl(resourceParams).then(function(res) {
          if(res.error){

          }else{
            initList();
            $scope.newResource = {};
            cancel();
            messenger.ok("Resource was successfully created.");
          }
        })
      }else{
        let resourceParams = {
          // topicId: topicId,
          userId: null,
          title: newResource.title,
          type: newResource.type,
          text: $scope.newResource.fileTst.name
        };

        GalleryServices.createResource(resourceParams).then(function(res) {
          if(res.error){
            messenger.ok(res.error);
          }else{
            Upload.upload({
              url: globalSettings.restUrl+'/gallery/uploadFile',
              method: 'POST',
              data: {uploadedfile: newResource.fileTst, type: resourceParams.type}
            }).then(
              function(res) {
                initList();
                $scope.newResource = {};
                cancel();
                messenger.ok("Resource was successfully created.");
              },

              function(err) {
                
              }
            );
          }
        })
      }
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

    function cancel(){
      domServices.modal('uploadTST', 'close');
    }
   
    $scope.selectedText = 'Select All';
    $scope.isAll = false;
    $scope.selectAllResources = function() {
      console.log($scope.selectedText);
      console.log($scope.isAll);
      console.log("THIS IS WORKING");
      if($scope.isAll === false) {
        angular.forEach($scope.resources, function(resource){
          resource.checked = true;
          $scope.idsForAction.push(resource.id);
        });
      
        $scope.isAll = true;  
        $scope.selectedText = 'Deselect All';

      } else {
        angular.forEach($scope.resources, function(resource){
          resource.checked = false;
        });

        $scope.idsForAction = [];
        $scope.isAll = false; 
        $scope.selectedText = 'Select All';
      }
    };

    $scope.setView =function(type) {
      
    }

    // $scope.filters = { };    
    // $scope.links = [
    //     {name: 'Audio', type: 'audio'},
    //     {name: 'Images', type: 'image'},
    //     {name: 'Youtube', type: 'video'}
    // ];

    $scope.downloadFile = function(resource) {
      dbg.yell(resource)
      $http.get(globalSettings.restUrl +'/chat_room/uploads/' + resource.JSON.name, {responseType:'blob'})
      .then(function(results){
          var data = results.data; 
          var blob = new Blob(
              [data],
              {type: resource.JSON.type + "/" + resource.JSON.format}
          );
          saveAs(blob, resource.JSON.name);
      });
    }

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
          messenger.ok(res.error);
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
          messenger.ok("Something went wrong, please try again later.");
        }else{
          window.location.assign('/chat_room/uploads/' + res.fileName);
        }
      })
    }
  }
})();
