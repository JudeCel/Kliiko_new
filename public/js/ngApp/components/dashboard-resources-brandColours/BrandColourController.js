(function () {
  'use strict';

  angular.module('KliikoApp').controller('BrandColourController', BrandColourController);

  BrandColourController.$inject = ['dbg', 'brandColourServices', 'angularConfirm', 'messenger', '$timeout', 'domServices', '$stateParams', '$state'];
  function BrandColourController(dbg, brandColourServices, angularConfirm, messenger, $timeout, domServices, $stateParams, $state) {
    dbg.log2('#BrandColourController started');

    var vm = this;

    vm.removeScheme = removeScheme;
    vm.copyScheme = copyScheme;
    vm.finishManage = finishManage;
    vm.changePage = changePage;
    vm.initColor = initColor;
    vm.openModalPreview = openModalPreview;
    vm.closeModelPreview = closeModelPreview;
    vm.undoCurrentScheme = undoCurrentScheme;
    vm.colorStyles = colorStyles;
    vm.prepareCurrentPageSchemes = prepareCurrentPageSchemes;
    vm.setSelectedId = setSelectedId;

    vm.schemes = {};
    vm.scheme = {};
    vm.colorForm = {};
    vm.defaultColours = { black: '#000000', white: '#FFFFFF' };
    vm.selectedId = null;

    vm.pagination = {
      schemesTotalItems: 0,
      schemesCurrentPage: 1,
      schemesItemsPerPage: 12,
      schemes: {}
    }

    changePage('index');
      
    function setSelectedId(selectedId) {
      if (vm.selectedId == null) {
        vm.selectedId = selectedId || 0;
      }
    }

    function prepareCurrentPageSchemes() {
      if (vm.schemes && vm.schemes.length > 0) {
        for (var i = 0, len = vm.schemes.length; i < len; i++) {
          if (vm.schemes[i].id == vm.selectedId) {
            let selectedItem = vm.schemes[i];
            vm.schemes.splice(i, 1);
            vm.schemes.unshift(selectedItem);
            break;
          }
        }
        vm.pagination.schemes = vm.schemes.slice(((vm.pagination.schemesCurrentPage - 1) * vm.pagination.schemesItemsPerPage), ((vm.pagination.schemesCurrentPage) * vm.pagination.schemesItemsPerPage));
        vm.pagination.schemesTotalItems = vm.schemes.length;
      }
      else {
        vm.pagination.schemes = {};
        vm.pagination.schemesTotalItems = 0;
      }
    }

    function init() {
      brandColourServices.getAllSchemes().then(function(res) {
        vm.schemes = res.data;
        vm.prepareCurrentPageSchemes();
        vm.manageFields = res.manageFields;
        vm.hexRegex = new RegExp(res.hexRegex);
        vm.memberColours = res.memberColours;
        dbg.log2('#BrandColourController > getAllSchemes > res ', res.data);

        // if we want to open create step from the start
        if ($stateParams.new)  changePage('create');
      });
    }

    function removeScheme(scheme) {
      angularConfirm('Are you sure you want to remove Scheme?').then(function(response) {
        brandColourServices.removeScheme({ id: scheme.id }).then(function(res) {
          dbg.log2('#BrandColourController > removeScheme > res ', res);

          if(res.error) {
            messenger.error(res.error);
          }
          else {
            messenger.ok(res.message);
            var index = vm.schemes.indexOf(scheme);
            vm.schemes.splice(index, 1);
            vm.prepareCurrentPageSchemes();
          }
        });
      });
    };

    function copyScheme(scheme) {
      brandColourServices.copyScheme({ id: scheme.id }).then(function(res) {
        dbg.log2('#BrandColourController > copyScheme > res ', res);

        if(res.error) {
          messenger.error(res.error);
        }
        else {
          vm.schemes.push(res.data);
          vm.prepareCurrentPageSchemes();
          messenger.ok(res.message);
        }
      });
    };

    function finishManage() {
      vm.formSubmitted = true;

      $timeout(function() {
        if(vm.colorForm.$valid) {
          if(vm.currentPage.type == 'create') {
            finishCreate();
          }
          else {
            finishEdit();
          }
        }
        else {
          vm.submitError = 'There are some unfilled fields';
        }
      }, 1000);
    };

    function finishCreate() {
      brandColourServices.createScheme(vm.scheme).then(function(res) {
        dbg.log2('#BrandColourController > finishCreate > res ', res);

        if(res.error) {
          messenger.error(res.error);
        }
        else {
          changePage('index');
          messenger.ok(res.message);
        }
      });
    };

    function finishEdit() {
      brandColourServices.updateScheme(vm.scheme).then(function(res) {
        dbg.log2('#BrandColourController > finishEdit > res ', res);

        if(res.error) {
          messenger.error(res.error);
        }
        else {
          changePage('index');
          messenger.ok(res.message);
        }
      });
    };

    function initColor(model, object) {
      vm.scheme.colours[model] = object[model] || vm.defaultColours.white;
      vm.previewScheme = vm.scheme;
    };

    function openModalPreview(scheme) {
      vm.previewScheme = scheme;
      domServices.modal('previewModal');
    };

    function closeModelPreview() {
      vm.previewScheme = {};
      domServices.modal('previewModal', 'close');
    }

    function changePage(page, scheme) {
      vm.formSubmitted = false;

      if(page == 'indexBack' && $stateParams.backTo) {
        $state.go($stateParams.backTo, {id:$stateParams.id});
        return
      }

      if(page == 'index' || page == 'indexBack') {
        init();
        vm.currentPage = { page: 'index' };
      }
      else {
        brandColourServices.canCreateCustomColors().then(function(res) {
          if(res.error) {
            messenger.error(res.error);
          }else{
            if(page == 'edit') {
              vm.originalScheme = {};
              angular.copy(scheme, vm.originalScheme);
            }
            else {
              vm.originalScheme = null;
            }

            vm.scheme = scheme || { colours: { } };
            vm.currentPage = { page: 'manage', type: page };
          }
        });
      }
    };

    function undoCurrentScheme() {
      if(vm.originalScheme) {
        angular.copy(vm.originalScheme, vm.scheme);
        vm.previewScheme = vm.scheme;
      }
    };

    function colorStyles(hex, options) {
      if(!hex) {
        hex = vm.defaultColours.white;
      }

      var css = {
        'background-color': hex,
        'color': invertColor(hex),
        'border-color': hex
      };

      return css;
    };

    function invertColor(hex) {
      if(vm.hexRegex.test(hex)) {
        var color = hex;
        color = color.substring(1);           // remove #
        color = parseInt(color, 16);          // convert to integer
        color = 0xFFFFFF ^ color;             // invert three bytes
        color = color.toString(16);           // convert to hex
        color = ('000000' + color).slice(-6); // pad with leading zeros
        color = '#' + color;                  // prepend #
        return color;
      }
      else {
        return vm.defaultColours.black;
      }
    };

  };
})();
