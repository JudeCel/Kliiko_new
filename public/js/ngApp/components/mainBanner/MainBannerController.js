(function () {
  'use strict';

  angular.
    module('KliikoApp').
    controller('MainBannerController', MainBannerController);

  MainBannerController.$inject = ['dbg', '$rootScope', 'user', 'banners'];
  function MainBannerController(dbg,  $rootScope, user, banners) {
    dbg.log2('#MainBannerController  started');
    var vm = this;


    $rootScope.$on('updateMainBanner', function(e, args) {
      if (!args.bannerData) { vm.banner = null;  return  }

      vm.banner = args.bannerData;
    });



  }


})();