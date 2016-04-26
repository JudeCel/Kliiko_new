(function () {
  'use strict';

  angular.module('KliikoApp').controller('BannerMessagesController', BannerMessagesController);
  BannerMessagesController.$inject = ['dbg', 'messenger', 'fileUploader', 'accountUser', '$window', 'BannerMessagesServices', '$scope'];
  function BannerMessagesController(dbg, messenger, fileUploader, accountUser, $window, BannerMessagesServices, $scope) {
    dbg.log2('#BannerMessagesController controller started');
    var vm = this;

    vm.file = {};
    vm.banners = ['profile', 'sessions', 'resources'];

    vm.init = init;
    vm.upload = upload;
    vm.update = update;
    vm.remove = remove;
    vm.isAdmin = isAdmin;

    $scope.$watch(function() {
      return sessionStorage.getItem('bannerType');
    }, function(next, prev) {
      if(!vm.currentBanner) {
        vm.currentBanner = next;
        waitForToken(next);
      }
      else if(next != prev) {
        vm.currentBanner = next;
        mapBanners(next);
      }
    });

    function init() {
      if(isAdmin()) {
        mapBanners();
      }
      else {
        $window.location.href = '/';
      }
    }

    function upload(bannerType) {
      var banner = vm.file[bannerType];
      var data = {
        file: banner.file,
        scope: 'banner',
        type: 'image',
        name: bannerType
      };

      fileUploader.upload(data).then(function(result) {
        banner = result.data;
        BannerMessagesServices.createBanner({ page: bannerType, resourceId: banner.resource.id }).then(function(result) {
          messenger.ok(result.message);
        }, function(error) {
          messenger.error(error);
        });
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
      var confirmation = confirm('Are you sure?');
      if(!confirmation) return;

      fileUploader.remove([vm.file[bannerType].resource.id]).then(function(result) {
        angular.copy({}, vm.file[bannerType]);
      });
    }

    function isAdmin() {
      return accountUser.isAdmin();
    }

    function mapBanners(next) {
      fileUploader.banner().then(function(result) {
        for(var i in result.banners) {
          var banner = result.banners[i];
          vm.file[banner.page] = banner;
        }
      });
    }

    function waitForToken(next) {
      setTimeout(function() {
        if(fileUploader.token) {
          mapBanners(next);
        }
        else {
          waitForToken(next);
        }
      }, 10);
    }
  }
})();
