(function () {
  'use strict';

  angular.
    module('KliikoApp').
    controller('BannerMessagesController', BannerMessagesController);

  BannerMessagesController.$inject = ['dbg', 'banners', 'ngProgressFactory', '$rootScope', 'messenger'];
  function BannerMessagesController(dbg, banners, ngProgressFactory, $rootScope, messenger) {
    dbg.log2('#BannerMessagesController controller started');
    var vm = this;

    vm.error = [];
    vm.profileBanner = {};
    vm.sessionsBanner = {};
    vm.resourcesBanner = {};

    vm.upload = upload;
    vm.remove = remove;
    vm.saveLink = saveLink;

    init();


    /**
     * Upload new banner with particular 'bannerType'
     * @param fileModel {file}
     * @param bannerType {string} - types can be found in models/templateBanners -> page
     */
    function upload(fileModel, bannerType) {
      var progressbar = ngProgressFactory.createInstance();
      progressbar.start();

      banners.upload(fileModel, bannerType).then(
        function(res) {
          dbg.log1('#BannerMessagesController > upload > success ', res);
          init();
          progressbar.complete();
        },
        function(err) {
          dbg.log1('#BannerMessagesController > upload > error ', err);

          var msg = '';
          for (var i = 0, len = err.length; i < len ; i++) {
            msg = msg + err[i].errorMessage +' ';
            vm.error.push(err[i].errorMessage);
          }

          messenger.error('Upload Fails: \n '+ msg);
          init();
          progressbar.complete();
        }
      );
    }

    /**
     * Remove banner by type (bannerType === app page)
     * @param bannerType {string}
     */
    function remove(bannerType) {
      var confirmation = confirm('Are you sure?');

      if (!confirmation) return;

      var progressbar = ngProgressFactory.createInstance();
      progressbar.start();
      vm[bannerType+'Banner'] = null;

      banners.remove(bannerType).then(
        function(res) {
          dbg.log2('#BannerMessagesController > remove > success', res);
          init();
          progressbar.complete();
        },
        function(err) {
          dbg.error('#BannerMessagesController > remove > error ', err);
          init();
          progressbar.complete();
        }
      );
    }

    function saveLink(bannerType) {
      console.log( vm[bannerType+'Banner'].link );
      banners.saveLink(bannerType, vm[bannerType+'Banner'].link).then(
        function(res) {  messenger.ok('Link saved') },
        function(err) {  messenger.error('Link not saved') }
      );

    }

    /**
     * Fetch and populate all banners
     */
    function init() {
      var InitProgressbar = ngProgressFactory.createInstance();
      InitProgressbar.start();

      banners.getAllBanners().then(function(res) {
        for (var key in res) {
          vm[key+'Banner'] = res[key];
        }

        InitProgressbar.complete();
      });

    }

  }


})();