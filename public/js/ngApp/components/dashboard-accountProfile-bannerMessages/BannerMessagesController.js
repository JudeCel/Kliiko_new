(function () {
  'use strict';

  angular.module('KliikoApp').controller('BannerMessagesController', BannerMessagesController);
  BannerMessagesController.$inject = ['dbg', 'messenger', 'fileUploader', 'accountUser', '$window'];
  function BannerMessagesController(dbg, messenger, fileUploader, accountUser, $window) {
    dbg.log2('#BannerMessagesController controller started');
    var vm = this;

    vm.file = {};
    vm.banners = ['profile', 'sessions', 'resources'];

    vm.init = init;
    vm.isAdmin = isAdmin;
    vm.upload = upload;
    vm.remove = remove;

    function isAdmin() {
      return accountUser.isAdmin();
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
        banner.resource = result.data.resource;
      });
    }

    function remove(bannerType) {
      var confirmation = confirm('Are you sure?');
      if(!confirmation) return;

      fileUploader.remove([vm.file[bannerType].resource.id]).then(function() {
        vm.file[bannerType] = {};
      });
    }

    function init() {
      if(isAdmin()) {
        fileUploader.list({ type: ['image'], scope: ['banner'] }).then(function(result) {
          console.log(result);
          for(var i in result.resources) {
            var banner = result.resources[i];
            console.log(banner);
          }
        });
      }
      else {
        $window.location.href = '/';
      }
    }
  }
})();
