(function () {
  'use strict';

  angular.module('KliikoApp').controller('BrandColourController', BrandColourController);
  BrandColourController.$inject = ['dbg', 'brandColourServices', 'angularConfirm', 'messenger', 'ngProgressFactory'];

  function BrandColourController(dbg, brandColourServices, angularConfirm, messenger, ngProgressFactory) {
    dbg.log2('#BrandColourController started');

    var vm = this;
    vm.removeScheme = removeScheme;
    vm.copyScheme = copyScheme;
    vm.changePage = changePage;
    vm.colorStyles = colorStyles;
    vm.schemes = {};

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

    function changePage(page, scheme) {
      if(page == 'index') {
        init();
        vm.currentPage = { page: page };
      }
      else {
        vm.scheme = scheme || {};
        vm.currentPage = { page: 'manage', type: page };
      }
    };

    function colorStyles(hex) {
      if(!hex) {
        hex = '#ffffff';
      }
      return {
        'background-color': hex,
        'color': invertColor(hex),
        'padding': '10px',
        'display': 'block',
        'max-width': '70%',
        'border': '0',
        'margin': '10px'
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
