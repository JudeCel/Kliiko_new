(function () {
  'use strict';

  angular.module('KliikoApp').controller('GalleryController', GalleryController);
  angular.module('KliikoApp.Root').controller('GalleryController', GalleryController);

  GalleryController.$inject = ['$q', 'dbg', 'GalleryServices', 'domServices', 'messenger', '$sce', 'messagesUtil', '$confirm', 'account', 'planService', 'errorMessenger'];
  function GalleryController($q, dbg, GalleryServices, domServices, messenger, $sce, messagesUtil, $confirm, accountData, planService, errorMessenger) {
    dbg.log2('#GalleryController started');
    var vm = this;
    vm.templatesDir = '/js/ngApp/components/dashboard-resources-gallery/templates/';
    vm.newResource = {};
    vm.resourceList = [];
    vm.selectionList = {};
    vm.currentList = [];
    vm.currentPage = { page: 'index', viewType: 'panel', viewClass: 'glyphicon glyphicon-th-list', upload: null, filter: null };
    vm.uploadTypes = [
      { id: 'image',         type: 'image', text: 'Image',             scope: 'collage',       format: '.gif, .jpeg, .jpg, .png, .bmp' },
      { id: 'brandLogo',     type: 'image', text: 'Brand Logo',        scope: 'brandLogo',     format: '.gif, .jpeg, .jpg, .png, .bmp' },
      { id: 'audio',         type: 'audio', text: 'Audio',             scope: 'collage',       format: '.mpeg, .mp3' },
      { id: 'pdf',           type: 'file',  text: 'PDF',               scope: 'pdf',           format: '.pdf' },
      { id: 'video',         type: 'video', text: 'Video',             scope: 'collage',       format: '.oog, .mp4' },
      { id: 'videoService',  type: 'link',  text: 'Youtube or Vimeo',  scope: 'videoService',  format: 'url' }
    ];
    vm.modalTab = {};
    vm.pagination = {
      totalItems: 0,
      currentPage: 1,
      itemsPerPage: 9,
      items: {}
    }

    resetSelectionList();

    vm.init = initController;
    vm.listResources = GalleryServices.listResources;
    vm.removeResources = removeResources;
    vm.replaceStockResource = replaceStockResource;
    vm.zipResources = zipResources;
    vm.refreshResource = refreshResource;
    vm.createOrReplaceResource = createOrReplaceResource;
    vm.changeView = changeView;
    vm.isTypeOf = isTypeOf;
    vm.getUploadType = getUploadType;
    vm.getUploadTypeFromResource = getUploadTypeFromResource;
    vm.resourceSelected = resourceSelected;
    vm.removeDependency = removeDependency;
    vm.getResourceFromList = getResourceFromList;
    vm.openUploadModal = openUploadModal;
    vm.openSelectOrUploadModal = openSelectOrUploadModal;
    vm.openSelectModal = openSelectModal;
    vm.selectAllResources = selectAllResources;
    vm.massAction = massAction;
    vm.filterResources = filterResources;
    vm.getFilterResources = getFilterResources;
    vm.videoServiceUrl = videoServiceUrl;
    vm.normalVideoServiceUrl = normalVideoServiceUrl;
    vm.resourceUrl = resourceUrl;
    vm.fileSelected = fileSelected;
    vm.setModalTab = setModalTab;
    vm.preloadResources = preloadResources;
    vm.prepareCurrentPageItems = prepareCurrentPageItems;
    vm.handleUploadPermission = handleUploadPermission;

    function resetSelectionList(params) {
      vm.selectionList = {};
      for(var i in vm.uploadTypes) {
        var upload = vm.uploadTypes[i];
        vm.selectionList[upload.id] = [];
      }
    }

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

    function replaceStockResource(resource, parent) {
      var id = resource.id;
      var type = null;
      for (var i=0; i<=parent.types.length; i++ ) {
        if (parent.types[i].type == resource.type && parent.types[i].scope == resource.scope) {
          type = parent.types[i];
          break;
        }
      }
      if (type) {
        openUploadModal(type, parent, resource);
      }
    }

    function removeResources(resourceIds) {
      GalleryServices.closedSessionResourcesRemoveCheck(resourceIds).then(function(result) {
        if (result.used_in_closed_session.items.length > 0) {
          $confirm({ text: result.used_in_closed_session.message }).then(function() {
            removeResourcesConfirmed(resourceIds);
          });
        } else {
          removeResourcesConfirmed(resourceIds);
        }
      }, function(error) {
        messenger.error(error);
      });
    }

    function removeResourcesConfirmed(resourceIds) {
      GalleryServices.removeResources(resourceIds).then(function(result) {
        if (result.removed.items.length > 0) {
          result.removed.items.map(function(deleted) {
            var removeIndex = vm.resourceList.map(function(resource) { return resource.id; }).indexOf(deleted.id);
            ~removeIndex && vm.resourceList.splice(removeIndex, 1);
          });
          filterResources(vm.currentPage.filter);
          messenger.ok(result.removed.message);
        }
        if (result.not_removed_stock.items.length > 0) {
          messenger.error(result.not_removed_stock.message);
        }
        if (result.not_removed_used.items.length > 0) {
          messenger.error(result.not_removed_used.message);
        }
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
            closeModalAndSetVariables(result, false);
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

    function createOrReplaceResource() {
      if (vm.currentPage.canSelect && vm.modalTab.link && vm.newResource.type == 'video') {
        var type = vm.getUploadType("videoService");
        vm.newResource.type = type.type;
        vm.newResource.scope = type.scope;
      }
      validateResource(function(errors) {
        if(errors) {
          messenger.error(errors);
        } else {
          vm.modalWindowDisabled = true;
          GalleryServices.createOrReplaceResource(vm.newResource).then(function(result) {
            closeModalAndSetVariables(result.data, vm.newResource.id ? true : false);
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
        videoService: resource.type == 'link' && resource.scope == 'videoService',
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
      if (vm.currentCallback) {
        domServices.modal('selectOrUploadResource', 'close');
        vm.currentCallback(resource);
      } else {
        domServices.modal('selectResource', 'close');
      }
    }

    function openSelectOrUploadModal(current, parent) {
      var type = current.type == 'link' ? vm.getUploadType("video") : current;
      vm.newResource = { type: current.type, scope: current.scope, typeId: type.id };
      vm.currentPage.upload = current.id;
      parent.modal.replace = false;
      parent = parent || { modal: {} };
      vm.currentModalSet = parent.modal.set;
      vm.currentDependency = parent.dependency;
      vm.currentCallback = parent.callback;
      vm.currentPage.canSelect = true;
      vm.setModalTab('gallery');

      var params = { type:[current.type], scope:[current.scope], stock: true };
      if (type.type == "video") {
        var videoServiceType = vm.getUploadType("videoService");
        params.type.push(videoServiceType.type);
        params.scope.push(videoServiceType.scope);
      }
      vm.pagination.currentPage = 1;
      preloadResources(params).then(function() {
        prepareCurrentPageItems();
        domServices.modal('selectOrUploadResource');
      });
    }

    function preloadResources(params) {
      var deferred = $q.defer();

      vm.listResources(params).then(function(result) {
        resetSelectionList();
        vm.resourceList = result.resources;
        for(var i in result.resources) {
          var resource = result.resources[i];
          var resType = vm.getUploadTypeFromResource(resource);
          vm.selectionList[resType].push(resource);
        }
        deferred.resolve();
      });

      return deferred.promise;
    }

    function fileSelected() {
      if ((!vm.newResource.name || vm.newResource.lastAutopopulatedName == vm.newResource.name) && vm.newResource.file) {
        vm.newResource.lastAutopopulatedName = vm.newResource.name = vm.newResource.file.name;
      }
    }

    function setModalTab(modalTab) {
      vm.modalTab = {};
      vm.modalTab[modalTab] = true;
    }

    function prepareCurrentPageItems() {
      var items = vm.selectionList[vm.newResource.typeId];
      if (vm.newResource.typeId == "video") {
        items = items.concat(vm.selectionList["videoService"]);
      }
      if (items.length > 0) {
        vm.pagination.totalItems = items.length;
        vm.pagination.items = items.slice(((vm.pagination.currentPage - 1) * vm.pagination.itemsPerPage), ((vm.pagination.currentPage) * vm.pagination.itemsPerPage));
      } else {
        vm.pagination.items = {};
        vm.pagination.totalItems = 0;
      }
    }

    function handleUploadPermission() {
      planService.checkPlanFeatures('brandLogoAndCustomColors').then(function(response) {
        if(response.error) {
          errorMessenger.showError(response.error);
        }
      });
    }

    function openUploadModal(current, parent, replaceResource, modalTitle) {
      vm.newResource = { type: current.type, scope: current.scope };
      vm.currentPage.upload = current.id;
      vm.isReplacingStock = replaceResource && replaceResource.stock;
      if (replaceResource) {
        vm.modalTitle = "Replace resource";
        parent.modal.replace = true;
        vm.newResource.stock = replaceResource.stock;
        vm.newResource.name = replaceResource.name;
        vm.newResource.id = replaceResource.id;
      } else {
        vm.modalTitle = "New resource";
        parent.modal.replace = true;
      }

      if (modalTitle) {
        vm.modalTitle = modalTitle;
      }

      domServices.modal('uploadResource');
      parent = parent || { modal: {} };
      vm.currentModalSet = parent.modal.set;
      vm.currentDependency = parent.dependency;
      vm.currentCallback = parent.callback;
      vm.currentPage.canSelect = false;
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
      } else {
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

      if (filter == 'stock') {
        for (var i in vm.resourceList) {
          var resource = vm.resourceList[i];
          if (resource.stock) {
            array.push(resource);
          }
        }
      } else if (filter) {
        var upload = getUploadType(filter);
        for (var i in vm.resourceList) {
          var resource = vm.resourceList[i];
          if (resource.type == upload.type && resource.scope == upload.scope) {
            if (key) {
              array.push(resource[key]);
            } else {
              array.push(resource);
            }
          }
        }
      } else {
        array = vm.resourceList;
      }

      return array;
    }

    function normalVideoServiceUrl(url, source) {
      return GalleryServices.prepareVideoServiceUrl;
    }

    function videoServiceUrl(url, source) {
      switch (source) {
        case "youtube":
          return $sce.trustAsResourceUrl('https://www.youtube.com/embed/' + url);
        case "vimeo":
          return $sce.trustAsResourceUrl('https://player.vimeo.com/video/' + url);
        default:
          return null;
      }
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

    function closeModalAndSetVariables(data, replace) {
      vm.modalWindowDisabled = false;
      if (replace) {
        for (var i=0; i<vm.resourceList.length; i++) {
          if (vm.resourceList[i].id == data.resource.id) {
            vm.resourceList[i] = data.resource;
            break;
          }
        }
        for (var i=0; i<vm.selectionList[vm.currentPage.upload].length; i++) {
          if (vm.selectionList[vm.currentPage.upload][i].id == data.resource.id) {
            vm.selectionList[vm.currentPage.upload][i] = data.resource;
            break;
          }
        }
      } else {
        vm.resourceList.push(data.resource);
        vm.selectionList[vm.currentPage.upload].push(data.resource);
      }
      domServices.modal(vm.currentPage.canSelect ? 'selectOrUploadResource' : 'uploadResource', 'close');
      setDependency(data.resource)
      filterResources(vm.currentPage.filter);
      messenger.ok(data.message);
      if (vm.currentCallback) {
        vm.currentCallback(data.resource);
      }
    }
  }
})();
