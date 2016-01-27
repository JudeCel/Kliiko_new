(function () {
  'use strict';

  angular.module('KliikoApp').controller('BrandColourController', BrandColourController);
  BrandColourController.$inject = ['dbg', 'brandColourServices', 'angularConfirm', 'messenger', 'ngProgressFactory', '$timeout', 'domServices'];

  function BrandColourController(dbg, brandColourServices, angularConfirm, messenger, ngProgressFactory, $timeout, domServices) {
    dbg.log2('#BrandColourController started');

    var vm = this;
    vm.removeScheme = removeScheme;
    vm.copyScheme = copyScheme;
    vm.finishManage = finishManage;
    vm.changePage = changePage;
    vm.initColor = initColor;
    vm.openModalPreview = openModalPreview;
    vm.closeModelPreview = closeModelPreview;
    vm.colorStyles = colorStyles;

    vm.schemes = {};
    vm.scheme = {};

    changePage('index');

    function init() {
      var progressbar = ngProgressFactory.createInstance();
      progressbar.start();

      brandColourServices.getAllSchemes().then(function(res) {
        progressbar.complete();
        vm.schemes = res.data;
        vm.manageFields = res.manageFields;
        dbg.log2('#BrandColourController > getAllSchemes > res ', res.data);
      });
    };

    function removeScheme(scheme) {
      angularConfirm('Are you sure you want to remove Scheme?').then(function(response) {
        var progressbar = ngProgressFactory.createInstance();
        progressbar.start();

        brandColourServices.removeScheme({ id: scheme.id }).then(function(res) {
          dbg.log2('#BrandColourController > removeScheme > res ', res);
          progressbar.complete();

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
      var progressbar = ngProgressFactory.createInstance();
      progressbar.start();

      brandColourServices.copyScheme({ id: scheme.id }).then(function(res) {
        dbg.log2('#BrandColourController > copyScheme > res ', res);
        progressbar.complete();

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
      var progressbar = ngProgressFactory.createInstance();
      progressbar.start();

      if(vm.currentPage.type == 'create') {
        finishCreate(progressbar);
      }
      else {
        finishEdit(progressbar);
      }
    };

    function finishCreate(progressbar) {
      brandColourServices.createScheme(vm.scheme).then(function(res) {
        dbg.log2('#BrandColourController > finishCreate > res ', res);

        progressbar.complete();
        if(res.error) {
          messenger.error(brandColourServices.prepareError(res.error));
        }
        else {
          changePage('index');
          messenger.ok(res.message);
        }
      });
    };

    function finishEdit(progressbar) {
      brandColourServices.updateScheme(vm.scheme).then(function(res) {
        dbg.log2('#BrandColourController > finishEdit > res ', res);

        progressbar.complete();
        if(res.error) {
          messenger.error(brandColourServices.prepareError(res.error));
        }
        else {
          changePage('index');
          messenger.ok(res.message);
        }
      });
    };

    function initColor(model) {
      vm.scheme[model] = vm.scheme[model] || '#000000';
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
      if(page == 'index') {
        init();
        vm.currentPage = { page: page };
      }
      else {
        vm.previewScheme = scheme || {};
        vm.scheme = scheme || {};
        vm.currentPage = { page: 'manage', type: page };
      }
    };

    function colorStyles(hex) {
      if(!hex) {
        hex = '#000000';
      }
      return {
        'background-color': hex,
        'color': invertColor(hex),
        'border': '1px solid ' + hex,
        'margin': '0'
      };
    };

    function invertColor(hex) {
      var color = hex;
      color = color.substring(1);           // remove #
      color = parseInt(color, 16);          // convert to integer
      color = 0xFFFFFF ^ color;             // invert three bytes
      color = color.toString(16);           // convert to hex
      color = ('000000' + color).slice(-6); // pad with leading zeros
      color = '#' + color;                  // prepend #
      return color;
    };

  };
})();
