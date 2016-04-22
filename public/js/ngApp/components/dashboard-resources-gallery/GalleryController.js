(function () {
  'use strict';

  angular.module('KliikoApp').controller('GalleryController', GalleryController);

  GalleryController.$inject = ['$q', 'dbg', 'GalleryServices', 'domServices', 'messenger', '$sce', '$scope'];
  function GalleryController($q, dbg, GalleryServices, domServices, messenger, $sce, $scope) {
    dbg.log2('#GalleryController started');
    var vm = this;

    vm.templatesDir = '/js/ngApp/components/dashboard-resources-gallery/templates/';
    vm.newResource = {};
    vm.resourceList = [];
    vm.selectionList = {};
    $scope.addedList = [];
    vm.galleryScope = $scope;
    vm.currentList = [];
    vm.currentPage = { page: 'index', viewType: 'panel', viewClass: 'glyphicon glyphicon-th-list', upload: null, filter: null };
    vm.uploadTypes = [
      { id: 'image',     type: 'image', text: 'Image',      scope: 'collage',   format: '.gif, .jpeg, .jpg, .png, .bmp' },
      { id: 'brandLogo', type: 'image', text: 'Brand Logo', scope: 'brandLogo', format: '.gif, .jpeg, .jpg, .png, .bmp' },
      { id: 'audio',     type: 'audio', text: 'Audio',      scope: 'collage',   format: '.mpeg, .mp3' },
      { id: 'pdf',       type: 'file',  text: 'PDF',        scope: 'pdf',       format: '.pdf' },
      { id: 'video',     type: 'video', text: 'Video',      scope: 'collage',   format: '.oog, .mp4' },
      { id: 'youtube',   type: 'link',  text: 'Youtube',    scope: 'youtube',   format: 'url' },
      { id: 'zip',       type: 'file',  text: 'Achive',     scope: 'zip',       format: null },
    ];

    for(var i in vm.uploadTypes) {
      var upload = vm.uploadTypes[i];
      vm.selectionList[upload.id] = [];
    }

    vm.init = initController;
    vm.listResources = GalleryServices.listResources;
    vm.removeResources = removeResources;
    vm.zipResources = zipResources;
    vm.refreshResource = refreshResource;
    vm.createResource = createResource;
    vm.changeView = changeView;
    vm.isTypeOf = isTypeOf;
    vm.getUploadType = getUploadType;
    vm.resourceSelected = resourceSelected;
    vm.openUploadModal = openUploadModal;
    vm.openSelectModal = openSelectModal;
    vm.selectAllResources = selectAllResources;
    vm.massAction = massAction;
    vm.filterResources = filterResources;
    vm.getFilterResources = getFilterResources;
    vm.youtubeUrl = youtubeUrl;

    function initController() {
      vm.currentPage.viewType = sessionStorage.getItem('viewType') || vm.currentPage.viewType;
      vm.currentPage.viewClass = sessionStorage.getItem('viewClass') || vm.currentPage.viewClass;

      GalleryServices.listResources().then(function(result) {
        vm.currentPage.main = true;
        vm.resourceList = result.resources;
        filterResources(vm.currentPage.filter);
      }, function(error) {
        messenger.error(error);
      });
    }

    function removeResources(resourceIds) {
      GalleryServices.removeResources(resourceIds).then(function(result) {
        result.ids.map(function(deleted) {
          var removeIndex = vm.resourceList.map(function(resource) { return resource.id; }).indexOf(deleted.id);
          ~removeIndex && vm.resourceList.splice(removeIndex, 1);
        });

        filterResources(vm.currentPage.filter);
        messenger.ok(result.message);
      }, function(error) {
        messenger.error(error);
      });
    }

    function zipResources() {
      validateResource(function(errors) {
        if(errors) {
          messenger.error(errors);
        }
        else {
          vm.modalWindowDisabled = true;
          GalleryServices.zipResources(vm.newResource.file, vm.newResource.name).then(function(result) {
            closeModalAndSetVariables(result);
          }, function(error) {
            vm.modalWindowDisabled = false;
            messenger.error(error);
          });
        }
      });
    }

    function refreshResource(resource) {
      let deferred = $q.defer();

      GalleryServices.refreshResource(resource.id).then(function(result) {
        angular.copy(result.resource, resource);
        messenger.ok(result.message);
        deferred.resolve(result.resource);
      }, function(error) {
        messenger.error(error);
        deferred.reject(error);
      });

      return deferred.promise;
    }

    function createResource() {
      validateResource(function(errors) {
        if(errors) {
          messenger.error(errors);
        }
        else {
          vm.modalWindowDisabled = true;
          GalleryServices.createResource(vm.newResource).then(function(result) {
            closeModalAndSetVariables(result.data);
          }, function(error) {
            vm.modalWindowDisabled = false;
            messenger.error(error);
          });
        }
      });
    }

    function changeView(type) {
      if(type == 'table') {
        vm.currentPage.viewType = 'panel';
        vm.currentPage.viewClass = 'glyphicon glyphicon-th-list';
      }
      else {
        vm.currentPage.viewType = 'table';
        vm.currentPage.viewClass = 'glyphicon glyphicon-th';
      }

      sessionStorage.setItem('viewType', vm.currentPage.viewType);
      sessionStorage.setItem('viewClass', vm.currentPage.viewClass);
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
        zip: resource.type == 'file' && resource.scope == 'zip',
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

    function resourceSelected(resource) {
      $scope.currentSelectedResource = resource;
      domServices.modal('selectResource', 'close');
    }

    function openUploadModal(id) {
      var upload = getUploadType(id);
      vm.newResource = { type: upload.type, scope: upload.scope };
      vm.currentPage.upload = id;
      domServices.modal('uploadResource');
    }

    function openSelectModal() {
      domServices.modal('selectResource');
    }

    function selectAllResources() {
      vm.currentList.map(function(resource) {
        resource.checked = vm.shouldSelectAllResources;
      });
    }

    function massAction(type) {
      var selectedResources = getSelectedResources('id');
      if(selectedResources.length) {
        switch(type) {
          case 'download':
            openUploadModal('zip');
            vm.newResource.file = selectedResources;
            break;
          case 'delete':
            removeResources(selectedResources);
            break;
          default:

        }
      }
      else {
        messenger.error('No resources selected');
      }
    }

    function filterResources(id) {
      vm.currentPage.filter = id;
      vm.currentList = getFilterResources(id);
      vm.shouldSelectAllResources = false;
    }

    function getFilterResources(filter, key) {
      var array = [];

      if(filter) {
        var upload = getUploadType(filter);
        for(var i in vm.resourceList) {
          var resource = vm.resourceList[i];
          if(resource.type == upload.type && resource.scope == upload.scope) {
            if(key) {
              array.push(resource[key]);
            }
            else {
              array.push(resource);
            }
          }
        }
      }
      else {
        array = vm.resourceList;
      }

      return array;
    }

    function youtubeUrl(url) {
      return $sce.trustAsResourceUrl('http://www.youtube.com/embed/' + url);
    }

    function getSelectedResources(key, filter) {
      var array = [];
      for(var i in vm.currentList) {
        var resource = vm.currentList[i];
        if(resource.checked) {
          if(key) {
            array.push(resource[key]);
          }
          else {
            array.push(resource);
          }
        }
      }

      return array;
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

    function closeModalAndSetVariables(data) {
      vm.modalWindowDisabled = false;
      vm.resourceList.push(data.resource);
      $scope.addedList.push(data.resource);
      vm.selectionList[vm.currentPage.upload].push(data.resource);
      domServices.modal('uploadResource', 'close');
      filterResources(vm.currentPage.filter);
      messenger.ok(data.message);
    }
  }
})();
