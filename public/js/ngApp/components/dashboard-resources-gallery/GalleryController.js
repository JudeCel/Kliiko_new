(function () {
  'use strict';

  angular.module('KliikoApp').controller('GalleryController', GalleryController);

  GalleryController.$inject = ['dbg', 'GalleryServices', '$modal', '$scope', 'domServices', 'messenger', '$sce', 'filterFilter', '$timeout', '$http'];
  function GalleryController(dbg, GalleryServices, $modal, $scope, domServices, messenger, $sce, filterFilter, $timeout, $http) {
    dbg.log2('#GalleryController started');
    var vm = this;

    vm.newResource = {};
    vm.currentPage = { page: 'index', viewType: 'panel', viewClass: 'glyphicon glyphicon-th-list', upload: null };
    vm.uploadTypes = [
      { id: 'image',     type: 'image', text: 'Image',      scope: 'collage',   format: '.gif, .jpeg, .jpg, .png, .bmp' },
      { id: 'brandLogo', type: 'image', text: 'Brand Logo', scope: 'brandLogo', format: '.gif, .jpeg, .jpg, .png, .bmp' },
      { id: 'audio',     type: 'audio', text: 'Audio',      scope: 'collage',   format: '.mpeg, .mp3' },
      { id: 'pdf',       type: 'file',  text: 'PDF',        scope: 'pdf',       format: '.pdf' },
      { id: 'video',     type: 'video', text: 'Video',      scope: 'collage',   format: '.oog, .mp4' },
      { id: 'youtube',   type: 'link',  text: 'Youtube',    scope: 'youtube',   format: 'url' },
    ];

    getResourceList();
    vm.getResourceList = getResourceList;
    vm.removeResources = removeResources;
    vm.createResource = createResource;
    vm.changeView = changeView;
    vm.isTypeOf = isTypeOf;
    vm.getUploadType = getUploadType;
    vm.openUploadModal = openUploadModal;

    function getResourceList() {
      GalleryServices.listResources().then(function(result) {
        vm.resourceList = result.resources;
      }, function(error) {
        messenger.error(error);
      });
    }

    function removeResources(resourceIds) {
      GalleryServices.removeResources(resourceIds).then(function(result) {
        messenger.ok(result.message);
        // remove from view
      }, function(error) {
        messenger.error(error);
      });
    }

    function createResource() {
      validateResource(function(errors) {
        if(errors) {
          messenger.error(errors);
        }
        else {
          vm.modalWindowDisabled = true;
          GalleryServices.createResource(vm.newResource).then(function(result) {
            vm.modalWindowDisabled = false;
            vm.resourceList = vm.resourceList.concat(result.data.resources);
            messenger.ok(result.message);
            domServices.modal('uploadResource', 'close');
          }, function(error) {
            vm.modalWindowDisabled = false;
            messenger.error(error);
          });
        }
      });
    }

    function changeView(type) {
      if(vm.currentPage.viewType == 'table') {
        vm.currentPage.viewType = 'panel';
        vm.currentPage.viewClass = 'glyphicon glyphicon-th-list';
      }
      else {
        vm.currentPage.viewType = 'table';
        vm.currentPage.viewClass = 'glyphicon glyphicon-th';
      }

      sessionStorage.setItem('viewType', vm.currentPage.viewType);
    }

    function isTypeOf(resource) {
      return {
        panel: vm.currentPage.viewType == 'panel',
        table: vm.currentPage.viewType == 'table',
        image: resource.type == 'image',
        audio: resource.type == 'audio',
        video: resource.type == 'video',
        brandLogo: resource.type == 'image' && resource.scope == 'brandLogo',
        youtube: resource.type == 'link' && resource.scope == 'youtube',
        pdf: resource.type == 'file' && resource.scope == 'pdf',
      };
    }

    function getUploadType(id) {
      for(var i in vm.uploadTypes) {
        var upload = vm.uploadTypes[i];
        if(upload.id == (id || vm.currentPage.upload)) {
          return upload;
        }
      }
    }

    function openUploadModal(id) {
      var upload = getUploadType(id);
      vm.newResource = { type: upload.type, scope: upload.scope };
      vm.currentPage.upload = id;
      console.log(id);
      domServices.modal('uploadResource');
    }

    function validateResource(callback) {
      var errors = {};
      if(invalidLength(vm.newResource.name)) {
        errors.name = 'No name provided';
      }

      if(!vm.newResource.file) {
        errors.file = 'No file provided';
      }

      var invalid = Object.keys(errors).length;
      callback(invalid ? errors : null);
    }

    function invalidLength(string) {
      return !(string && string.length);
    }

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
    ];


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
        private: newResource.private,
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
          messenger.ok("Resource was successfully created.");
        }
      })
    }

    function saveResource(newResource){
      if(newResource.fileTst){

        var resourceParams = {
          title: newResource.title,
          type: newResource.type,
          text: $scope.newResource.fileTst.name,
          file: newResource.fileTst,
          private: newResource.private
        };

        $scope.submitIsDisabled = true;
        GalleryServices.createResource(resourceParams).then(function(res) {
          if(res.error){
            messenger.error(res.error);
            $scope.submitIsDisabled = false;
          }else{
             GalleryServices.postuploadData(resourceParams).then(function(res) {
              if(res.error){
                $scope.newResource.fileTst = null;
                messenger.error(res.error);
                $scope.submitIsDisabled = false;
              }else{
                $scope.resources.push(res.data);
                cancel()
                messenger.ok("Resource was successfully created.");
                $scope.submitIsDisabled = false;
              }
            })
          }
        })
      }else{
        messenger.error("Please select a file.");
      }
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
    };

    $scope.checkType = function(first, second) {
      return first == second;
    };

    $scope.getResourceNameUrl = function(resource){
      return "/chat_room/uploads/" + resource.JSON.name;
    };

    $scope.getResourceThumbUrl = function(resource){
      return "/chat_room/uploads/" + resource.JSON.tableThumb;
    };

    $scope.resourceTitle = function(text){
      if(text.length < 1){
        return "No title.";
      }else if(text.length > 10){
        return text.substring(10, length)+'...';
      }else{
        return text;
      }
    }

  }
})();
