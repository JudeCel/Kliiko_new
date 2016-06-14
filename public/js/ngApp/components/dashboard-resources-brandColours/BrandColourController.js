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

    vm.schemes = {};
    vm.scheme = {};
    vm.colorForm = {};
    vm.defaultColours = { black: '#000000', white: '#FFFFFF' };

    changePage('index');

    function init() {
      brandColourServices.getAllSchemes().then(function(res) {
        vm.schemes = res.data;
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
            messenger.error(brandColourServices.prepareError(res.error));
          }
          else {
            messenger.ok(res.message);
            var index = vm.schemes.indexOf(scheme);
            vm.schemes.splice(index, 1);
          }
        });
      });
    };

    function copyScheme(scheme) {
      brandColourServices.copyScheme({ id: scheme.id }).then(function(res) {
        dbg.log2('#BrandColourController > copyScheme > res ', res);

        if(res.error) {
          messenger.error(brandColourServices.prepareError(res.error));
        }
        else {
          vm.schemes.push(res.data);
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
          messenger.error(brandColourServices.prepareError(res.error));
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
          messenger.error(brandColourServices.prepareError(res.error));
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
