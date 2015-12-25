(function () {
  'use strict';

  angular.
    module('KliikoApp').
    controller('BannerMessagesController', BannerMessagesController);

  BannerMessagesController.$inject = ['dbg', 'bannerMessagesService', 'ngProgressFactory', '$mdDialog', 'messenger'];
  function BannerMessagesController(dbg, bannerMessagesService, ngProgressFactory, $mdDialog, messenger) {
    dbg.log2('#BannerMessagesController controller started');
    var vm = this;

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

      bannerMessagesService.upload(fileModel, bannerType).then(
        function(res) {
          dbg.log2('#BannerMessagesController > upload > success ', res);
          init();
          progressbar.complete();
        },
        function(err) {
          dbg.error('#BannerMessagesController > upload > error ', err);
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
      var progressbar = ngProgressFactory.createInstance();
      progressbar.start();
      vm[bannerType+'Banner'].filepath = null;

      bannerMessagesService.remove(bannerType).then(
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
      bannerMessagesService.saveLink(bannerType, vm[bannerType+'Banner'].link).then(
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

      bannerMessagesService.getAllBanners().then(function(res) {

        for (var key in res) {
          vm[key+'Banner'] = res[key];
        }

        InitProgressbar.complete();
      });

    }

  }


})();