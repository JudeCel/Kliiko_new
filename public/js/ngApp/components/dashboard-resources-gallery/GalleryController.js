(function () {
  'use strict';

  angular.
    module('KliikoApp').
    controller('GalleryController', GalleryController);

  GalleryController.$inject = ['dbg', 'GalleryServices', '$modal', 
                               '$scope', 'domServices', 'messenger',
                               'globalSettings', '$sce', 'filterFilter', '$timeout', 'ngProgressFactory'];

  function GalleryController(dbg, GalleryServices, $modal, $scope, domServices, messenger, globalSettings, $sce, filterFilter, $timeout, ngProgressFactory){
    dbg.log2('#GalleryController  started');
    initList();
    $scope.filterType = "";
    $scope.viewType = sessionStorage.getItem('viewType');
    $scope.uploads = [
      { fileType: "image", uploadText: "Upload Image", filterText: "Images"},
      { fileType: "brandLogo", uploadText: "Upload Brand Logo", filterText: "Brand Logos"},
      { fileType: "audio", uploadText: "Upload Audio", filterText: "Audios"},
      { fileType: "pdf", uploadText: "Upload PDF", filterText: "PDF's"},
      { fileType: "video", uploadText: "Upload Video", filterText: "Videos"},
      { fileType: "youtubeUrl", uploadText: "Save youtube URL", filterText: "Youtube URL's"},
    ]

    function initList() {
      if(!sessionStorage.getItem('viewType')){
        sessionStorage.setItem('viewType', 'panel');
        $scope.viewType = sessionStorage.getItem('viewType');
      }
      GalleryServices.getResources({type: ""}).then(function(res) {
        $scope.resources = res.data;
      });
    }

    $scope.setView = function(type) {
      sessionStorage.setItem('viewType', type);
      $scope.viewType = sessionStorage.getItem('viewType');
    }

    $scope.newResource = {};
    $scope.dataForValidation = {};
    $scope.idsForAction = [];
    $scope.action = "";

    $scope.clearFormData = function() {
      $scope.newResource = {};
    }
    
    $scope.filterBy = function(type) {
      $scope.filterType = type;
    }

    $scope.getCount = function(type){
      var filtered = filterFilter( $scope.resources, {resourceType:type});
      if(filtered){
        return filtered.length;
      }
    }

    $scope.renderHtml = function (htmlCode) {
      return $sce.trustAsHtml(htmlCode);
    };

    $scope.resourcesSelected = function(id) {
      var isSelected = $scope.idsForAction.indexOf(id) == -1;
      if(isSelected){
        $scope.idsForAction.push(id);
      }else{
        $scope.idsForAction.splice($scope.idsForAction.indexOf(id), 1);
      }
    }

    $scope.uploadResourceForm = function(uploadType) {
      $scope.newResource.type = uploadType;
      $scope.uploadTypeForTitle = uploadTypeForTitle(uploadType);
      setUploadtype(uploadType);
      domServices.modal('uploadResource');
    };

    $scope.submitForm = function(newResource) {
      if(newResource.type == "youtubeUrl"){
        saveYoutube(newResource);
      }else{
        saveResource(newResource);
      }
    };

    function setUploadtype(type){ 
      if(type == 'image' || type == 'brandLogo'){
        $scope.allowToUpload = "image/gif, image/jpeg, image/jpg, image/png, image/bmp"
      }else if(type == 'audio'){
        $scope.allowToUpload = "audio/mpeg, audio/mp3"
      }else if(type == 'pdf'){
        $scope.allowToUpload = "application/pdf"
      }else if('video'){
        $scope.allowToUpload = "video/oog, video/mp4"
      }
    }

    function saveYoutube(newResource){
      var progressbar = ngProgressFactory.createInstance();
      progressbar.start();

      var resourceParams = {
        title: newResource.title,
        text: newResource.youtubeUrl
      };
      
      GalleryServices.saveYoutubeUrl(resourceParams).then(function(res) {
        if(res.error){
          progressbar.complete();
          messenger.error(res.error);
        }else{
          $scope.resources.push(res);
          cancel()
          progressbar.complete();
          messenger.ok("Resource was sucessfully created.");
        }
      })
    }

    function saveResource(newResource){
      var progressbar = ngProgressFactory.createInstance();
      progressbar.start();

      var resourceParams = {
        title: newResource.title,
        type: newResource.type,
        text: $scope.newResource.fileTst.name,
        file: newResource.fileTst
      };

      $scope.submitIsDisabled = true;

      GalleryServices.createResource(resourceParams).then(function(res) {
        if(res.error){
          messenger.error(res.error);
          $scope.submitIsDisabled = false;
          progressbar.complete();
        }else{
           GalleryServices.postuploadData(resourceParams).then(function(res) {
            if(res.error){
              messenger.error(res.error);
              $scope.submitIsDisabled = false;
              progressbar.complete();
            }else{
              $scope.resources.push(res.data);
              cancel()
              messenger.ok("Resource was sucessfully created.");
              $scope.submitIsDisabled = false;
              progressbar.complete();
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
      $scope.newResource = {};
      domServices.modal('uploadResource', 'close');
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
      if($scope.action == "delete"){
        $scope.deleteResources($scope.idsForAction);
      }

      if($scope.action == "download"){
        $scope.downloadResources($scope.idsForAction);
      }
    }

    $scope.deleteResources = function(ids) {
      var progressbar = ngProgressFactory.createInstance();
      progressbar.start();

      GalleryServices.deleteResources({resource_id: ids}).then(function(res) {
        if(res.error){
          messenger.error(res.error);
          progressbar.complete();
        }else{
          unselectIfAllSelected();
          initList();
          $scope.idsForAction = [];
          progressbar.complete();
          messenger.ok("Your selected resource(s) was successfully deleted.");
        }
      });
    }

    $scope.downloadResources = function(ids) {
      var progressbar = ngProgressFactory.createInstance();
      progressbar.start();

      GalleryServices.downloadResources({resource_id: ids}).then(function(res) {
        if(res.error){
          messenger.error(res.error);
          progressbar.complete();
        }else{
          unselectIfAllSelected();
          $scope.idsForAction = [];
          window.location.assign('/chat_room/uploads/' + res.fileName);
          progressbar.complete();
          deleteGeneratedZip(res.fileName);
        }
      })
    }

    function unselectIfAllSelected() {
      if($scope.isAll){
        $scope.selectAllResources();
      }
    }

    function deleteGeneratedZip(name){
      $timeout(function() { // move this to some kind cron task in backend, so the file is not imediatly deleted.
        GalleryServices.deleteZipFile({fileName: name}).then(function(res) {
          if(res.error){
            console.log(res.error);
          }else{
            console.log(res.message);
          }
        })
      }, 10000); 
    }

    $scope.disableButton = function() {
      $scope.submitIsDisabled = true;
    }

    $scope.checkType = function(first, second) {
      return first == second;
    }

    $scope.getResourceNameUrl = function(resource){
      return "/chat_room/uploads/" + resource.JSON.name;
    }

    $scope.getResourceThumbUrl = function(resource){
      return "/chat_room/uploads/" + resource.JSON.tableThumb;
    }

    $scope.resourceTitle = function(text){
      if(text.length < 1){
        return "There was not title provided.";
      }else if(text.length > 10){
        return text.substring(10, length)+'...';
      }else{
        return text;
      }
    }
    
  }
})();
