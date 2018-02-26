(function () {
  'use strict';

  angular.module('KliikoApp').controller('BannerMessagesController', BannerMessagesController);
  BannerMessagesController.$inject = ['dbg', 'messenger', 'fileUploader', 'accountUser', '$window', 'BannerMessagesServices', '$scope'];
  function BannerMessagesController(dbg, messenger, fileUploader, accountUser, $window, BannerMessagesServices, $scope) {
    dbg.log2('#BannerMessagesController controller started');
    var vm = this;

    vm.file = {};
    vm.banners = ['profile', 'sessions', 'resources'];
    for(var i in vm.banners) {
      var banner = vm.banners[i];
      vm.file[banner] = {};
    }

    vm.init = init;
    vm.upload = upload;
    vm.update = update;
    vm.remove = remove;

    $scope.$watch(function() {
      return sessionStorage.getItem('bannerType');
    }, function(next, prev) {
      if(!vm.currentBanner || next != prev) {
        vm.currentBanner = next;
        mapBanners(next);
      }
    });

    function init() {
      mapBanners();
    }

    function upload(bannerType) {
      var banner = vm.file[bannerType];
      var data = {
        file: banner.file,
        scope: 'banner',
        type: 'image',
        name: bannerType
      };
      if (!banner.file) {
        return;
      }

      fileUploader.upload(data).then(function(result) {
        var resource = result.data.resource;
        BannerMessagesServices.createBanner({ page: bannerType, resourceId: resource.id }).then(function(result) {
          vm.file[bannerType] = result.data;
          vm.file[bannerType].resource = resource;
          messenger.ok(result.message);
        }, function(error) {
          messenger.error(error);
        });
      }, function(error) {
         messenger.error(error);
       });
    }

    function update(bannerType) {
      var banner = vm.file[bannerType];

      BannerMessagesServices.updateBanner({ link: banner.link, id: banner.id }).then(function(result) {
        banner.link = result.data.link;
        messenger.ok(result.message);
      }, function(error) {
        messenger.error(error);
      });
    }

    function remove(bannerType) {
      var confirmation = confirm("Are you sure, that you want to delete this banner?");
      if(!confirmation) return;

      fileUploader.remove([vm.file[bannerType].resource.id]).then(function(result) {
        angular.copy({}, vm.file[bannerType]);
      });
    }

    function mapBanners(next) {
      fileUploader.banner().then(function(result) {
        for(var i in result.banners) {
          var banner = result.banners[i];
          vm.file[banner.page] = banner;
        }
      });
    }
  }
})();
