(function () {
  'use strict';

  angular.module('KliikoApp').controller('GalleryController', GalleryController);
  angular.module('KliikoApp.Root').controller('GalleryController', GalleryController);

  GalleryController.$inject = ['$q', 'dbg', 'GalleryServices', 'domServices', 'messenger', '$sce', 'messagesUtil'];
  function GalleryController($q, dbg, GalleryServices, domServices, messenger, $sce, messagesUtil) {
    dbg.log2('#GalleryController started');
    var vm = this;

    vm.templatesDir = '/js/ngApp/components/dashboard-resources-gallery/templates/';
    vm.newResource = {};
    vm.resourceList = [];
    vm.selectionList = {};
    vm.currentList = [];
    vm.currentPage = { page: 'index', viewType: 'panel', viewClass: 'glyphicon glyphicon-th-list', upload: null, filter: null };
    vm.uploadTypes = [
      { id: 'image',     type: 'image', text: 'Image',      scope: 'collage',   format: '.gif, .jpeg, .jpg, .png, .bmp' },
      { id: 'brandLogo', type: 'image', text: 'Brand Logo', scope: 'brandLogo', format: '.gif, .jpeg, .jpg, .png, .bmp' },
      { id: 'audio',     type: 'audio', text: 'Audio',      scope: 'collage',   format: '.mpeg, .mp3' },
      { id: 'pdf',       type: 'file',  text: 'PDF',        scope: 'pdf',       format: '.pdf' },
      { id: 'video',     type: 'video', text: 'Video',      scope: 'collage',   format: '.oog, .mp4' },
      { id: 'youtube',   type: 'link',  text: 'Youtube',    scope: 'youtube',   format: 'url' }
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
    vm.getUploadTypeFromResource = getUploadTypeFromResource;
    vm.resourceSelected = resourceSelected;
    vm.removeDependency = removeDependency;
    vm.getResourceFromList = getResourceFromList;
    vm.openUploadModal = openUploadModal;
    vm.openSelectModal = openSelectModal;
    vm.selectAllResources = selectAllResources;
    vm.massAction = massAction;
    vm.filterResources = filterResources;
    vm.getFilterResources = getFilterResources;
    vm.youtubeUrl = youtubeUrl;
    vm.normalYoutubeUrl = normalYoutubeUrl;
    vm.resourceUrl = resourceUrl;

    function initController() {
      vm.currentPage.viewType = sessionStorage.getItem('viewType') || vm.currentPage.viewType;
      vm.currentPage.viewClass = sessionStorage.getItem('viewClass') || vm.currentPage.viewClass;

      var scopes = [], types = [];
      for(var i in vm.uploadTypes) {
        var upload = vm.uploadTypes[i];
        if (scopes.indexOf(upload.scope) == -1) {
          scopes.push(upload.scope);
        }
        if (types.indexOf(upload.type) == -1) {
          types.push(upload.type);
        }
      }

      GalleryServices.listResources({ scope: scopes, type: types, stock: true }).then(function(result) {
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
      var deferred = $q.defer();

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
        image: resource.type == 'image' && resource.scope == 'collage',
        audio: resource.type == 'audio' && resource.scope == 'collage',
        video: resource.type == 'video' && resource.scope == 'collage',
        brandLogo: resource.type == 'image' && resource.scope == 'brandLogo',
        youtube: resource.type == 'link' && resource.scope == 'youtube',
        pdf: resource.type == 'file' && resource.scope == 'pdf',
        zip: resource.type == 'file' && resource.scope == 'zip',
      };
    }

    function getUploadTypeFromResource(resource) {
      var types = isTypeOf(resource);
      delete types.panel;
      delete types.table;
      for(var i in types) {
        var type = types[i];
        if(type) {
          return i;
        }
      }
    }

    function getUploadType(id) {
      for(var i in vm.uploadTypes) {
        var upload = vm.uploadTypes[i];
        if(upload.id == (id || vm.currentPage.upload)) {
          return upload;
        }
      }
    }

    function setDependency(resource) {
      if(vm.currentDependency) {
        vm.currentDependency.resourceId = resource.id;
        vm.currentDependency.resource = resource;
      }
    }

    function removeDependency(dependency) {
      if(dependency) {
        dependency.resourceId = null;
        dependency.resource = null;
      }
    }

    function getResourceFromList(dependency) {
      if(!dependency) {
        return null;
      }
      else if(dependency.resource) {
        return dependency.resource;
      }
      else if(dependency.resourceId) {
        for(var i in vm.resourceList) {
          var resource = vm.resourceList[i];
          if(resource.id == dependency.resourceId) {
            dependency.resource = resource;
            return resource;
          }
        }
      }
      else {
        return null;
      }
    }

    function resourceSelected(resource) {
      setDependency(resource);
      domServices.modal('selectResource', 'close');
    }

    function openUploadModal(current, parent) {
      vm.newResource = { type: current.type, scope: current.scope };
      vm.currentPage.upload = current.id;
      domServices.modal('uploadResource');
      parent = parent || { modal: {} };
      vm.currentModalSet = parent.modal.set;
      vm.currentDependency = parent.dependency;
      vm.currentCallback = parent.callback;
    }

    function openSelectModal(parent) {
      vm.currentModalSet = parent.modal.set;
      vm.currentDependency = parent.dependency;
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
            var upload = getUploadType('zip');
            openUploadModal(upload);
            vm.newResource.file = selectedResources;
            break;
          case 'delete':
            removeResources(selectedResources);
            break;
          default:

        }
      }
      else {
        messenger.error(messagesUtil.gallery.noResource);
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

    function normalYoutubeUrl(url) {
      return 'https://www.youtube.com/watch?v=' + url;
    }

    function youtubeUrl(url) {
      return $sce.trustAsResourceUrl('https://www.youtube.com/embed/' + url);
    }

    function resourceUrl(url) {
      return $sce.trustAsResourceUrl(url);
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
      vm.selectionList[vm.currentPage.upload].push(data.resource);
      domServices.modal('uploadResource', 'close');
      setDependency(data.resource)
      filterResources(vm.currentPage.filter);
      messenger.ok(data.message);
      if(vm.currentCallback) {
        vm.currentCallback(data.resource);
      }
    }
  }
})();
