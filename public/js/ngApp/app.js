(function () {
    'use strict';

    angular
        .module('KliikoApp', [
            //common modules
            'ngRoute',
            'ngResource',
            'ngMaterial',
            'ui.bootstrap',
            'ui.router',
            'globalSettings',
            'debModule',
            'domServices'
        ])
        .config(appConfigs)
        .run(appRun)
        .controller('AppController', AppController);
//
//
    appConfigs.$inject = ['dbgProvider',  '$routeProvider', '$locationProvider', '$rootScopeProvider'];
    function appConfigs(dbgProvider, $routeProvider, $locationProvider, $rootScopeProvider) {
        //$rootScopeProvider.digestTtl(20);

        // use the HTML5 History API
       // $locationProvider.html5Mode(true);

        dbgProvider.enable(1);
        dbgProvider.debugLevel('trace');

    }

    appRun.$inject = ['$stateParams',  'dbg',  '$rootScope', '$state', 'globalSettings'];
    function appRun($stateParams,  dbg,   $rootScope, $state, globalSettings) {
        dbg.log('#appRun started ');

        String.prototype.capitalize = function() {
            return this.charAt(0).toUpperCase() + this.slice(1);
        };

        $rootScope.appGlobals = {};

    }

    AppController.$inject = ['$rootScope', 'dbg', '$scope', '$mdDialog', '$mdMedia'];
    function AppController($rootScope, dbg, $scope, $mdDialog, $mdMedia) {
        var vm = this;

        dbg.log2('#AppController started ');

    }


})();





///* App Module */
    //
    //var kliikoApp = angular.module('KliikoApp', [])
    //    .controller('DashboardCtrl', ['$scope',
    //        function($scope) {
    //
    //        }]);
    //
    //
    //$('#play-video').on('click',function(){
    //    if($('#video-placeholder').css('display')!='none'){
    //        $('#video').show().siblings('div').hide();
    //    }else if($('#video').css('display')!='none'){
    //        $('#video-placeholder').show().siblings('div').hide();
    //    }
    //});
    //
    //$("#play-video").click(function(){
    //    player = new YT.Player('player', {
    //        width : '100%',
    //        height : '100%',
    //        videoId : 'H8PC1_3fjvs',
    //        playerVars: { 'autoplay': 1 },
    //        events : {
    //            'onReady' : onPlayerReady,
    //            'onStateChange' : onPlayerStateChange
    //        }
    //    });
    //});
    //
    //var tag = document.createElement('script');
    //tag.src = "https://www.youtube.com/iframe_api";
    //var firstScriptTag = document.getElementsByTagName('script')[0];
    //firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    //
    //var player;
    //function onPlayerReady(event) {
    //    //event.target.playVideo();
    //}
    //function onPlayerStateChange(event) {
    //    if(event.data == YT.PlayerState.ENDED) {
    //        player.destroy();
    //    }
    //}
    //
