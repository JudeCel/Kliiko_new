(function () {
  'use strict';

  var includes = [
    // common modules
    'ngRoute',
    'ngResource',
    'ngProgress',
    'ngMaterial',
    'ui.bootstrap',
    'ui.router',
    'globalSettings',
    'debModule',
    'domServices',
    'messenger',
    'errorMessenger',
    'infoMessenger',
    'ngMessages',
    'ngCookies',
    'colorpicker.module',
    'betsol.intlTelInput',
    'ngDraggable',
    'contactList',
    'topicsAndSessions',
    'ngFileUpload',
    'ui.sortable',
    'angularUtils.directives.dirPagination',
    'toggle-switch',
    'angular-confirm',
    'ngSanitize',
    'vkEmojiPicker',
    // app modules
    'KliikoApp.user',
    'KliikoApp.account',
    'KliikoApp.accountUser',
    'KliikoApp.fileUploader',
    'KliikoApp.changesValidation',
    'KliikoApp.goToChatroom',
    'KliikoApp.mailTemplate',
    'KliikoApp.sessionExpire'
  ];

  angular
    .module('KliikoApp', includes)
    .factory('myInterceptor', myInterceptor)
    .config(appConfigs)
    .config(phoneNumbersConfig)
    .constant('messagesUtil', messagesUtilObject())
    .run(appRun)
    .controller('AppController', AppController);

  angular
    .module('KliikoApp.Root', includes)
    .factory('myInterceptor', myInterceptor)
    .config(appConfigs)
    .config(phoneNumbersConfig)
    .constant('messagesUtil', messagesUtilObject())
    .run(appRun)
    .controller('AppController', AppController);

  function phoneNumbersConfig(intlTelInputOptions) {
    angular.extend(intlTelInputOptions, {
      nationalMode: false,
      defaultCountry: 'au',
      preferredCountries: ['au'],
      utilsScript: '/js/vendors/intl-tel-input/src/utils.js',
      autoFormat: true,
      autoPlaceholder: true
    });
  }

  myInterceptor.$inject = ['$log','$q', '$rootScope', 'messenger', 'globalSettings'];
  function myInterceptor($log, $q, $rootScope, messenger, globalSettings) {
    // Show progress bar on every request

    var requestInterceptor = {
      request: function(config) {
        config.url = (globalSettings.restUrl + config.url)
        if(config.transformResponse.length > 0) {
          $rootScope.progressbarStart();
          $rootScope.showSpinner = true;
        }

        return config;
      },

      'response': function(response) {
        if (response.status == 404) {
          alert('that is all folks');
        }
        if(response.config.transformResponse.length > 0) {
          $rootScope.showSpinner = false;
          $rootScope.progressbarComplete();
          deactivateHelperNote();
        }
        return response;
      },

      // optional method
      'responseError': function(rejection) {
        if(rejection.status == 404) {
          messenger.error(rejection.data);
        }
        $rootScope.showSpinner = false;
        $rootScope.progressbarComplete();
        return $q.reject(rejection);
      }
    };

    function deactivateHelperNote() {
      if (window.inline_manual_player) {
        window.inline_manual_player.deactivate();
      }
    }

    return requestInterceptor;
  }

  appConfigs.$inject = ['dbgProvider', '$routeProvider', '$locationProvider', '$rootScopeProvider', '$httpProvider'];
  function appConfigs(dbgProvider, $routeProvider, $locationProvider, $rootScopeProvider, $httpProvider) {
    //$rootScopeProvider.digestTtl(20);
    dbgProvider.enable(1);
    dbgProvider.debugLevel('trace');
    var token = 'Bearer ' + window.localStorage.getItem("jwtToken");
    var headers = Object.keys($httpProvider.defaults.headers);

    for (var i = 0; i < headers.length; i++) {
      $httpProvider.defaults.headers[headers[i]].Authorization = token
    }

    $httpProvider.interceptors.push('myInterceptor');
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};
    }

    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
  }

  appRun.$inject = ['$stateParams', 'dbg', '$rootScope', '$state', 'globalSettings', 'ngProgressFactory', 'messenger', '$confirmModalDefaults'];
  function appRun($stateParams, dbg, $rootScope, $state, globalSettings, ngProgressFactory, messenger, $confirmModalDefaults) {
    dbg.log('#appRun started ');
    var routerProgressbar;
    var rootScopeProgress = ngProgressFactory.createInstance();

    String.prototype.capitalize = function () {
      return this.charAt(0).toUpperCase() + this.slice(1);
    };

    $rootScope.appGlobals = {};

    // show and hide progress bar on state change
    $rootScope.$on('$stateChangeStart',  function(){
      routerProgressbar = ngProgressFactory.createInstance();
      routerProgressbar.start();
    });
    $rootScope.$on('$stateChangeSuccess',function(){
      $('.modal-backdrop').remove();
      messenger.clear();
      routerProgressbar.complete();
    });

    $rootScope.progressbarStart = function() {
      rootScopeProgress.start();
    };
    $rootScope.progressbarComplete = function() {
      rootScopeProgress.complete();
    }

    $confirmModalDefaults.templateUrl = '/js/ngApp/templates/confirm-dialog.tpl.html';
    $confirmModalDefaults.defaultLabels.title = 'Are you sure?';
    $confirmModalDefaults.defaultLabels.ok = 'Continue';
    $confirmModalDefaults.defaultLabels.cancel = 'Cancel';
    $confirmModalDefaults.defaultLabels.close = 'Close';

  }

  AppController.$inject = ['$rootScope', 'dbg', 'user', '$q', 'accountUser', 'account','$cookies', '$injector', 'fileUploader', 'domServices', '$scope', 'sessionExpire'];
  function AppController($rootScope, dbg, user, $q, accountUser, account, $cookies, $injector, fileUploader, domServices, $scope, sessionExpire) {
    var vm = this;
    vm.openModal = openModal;
    dbg.log2('#AppController started ');
    $rootScope.$on('app.updateUser', init);

    init();

    function init() {
      user.getUserData(vm).then(function(res) {
        setSessionStorage(res);
        vm.user = res;
      });
      accountUser.getAccountUserData().then(function(res) {
        console.log(res);
        vm.accountUser = res
      });
      account.getAccountData().then(function(res) { vm.account = res });
      sessionExpire.init();
    }

    function openModal(id) {
      setTimeout(function () {
        domServices.modal(id);
      }, 10);
    }

    function setSessionStorage(res) {
      if(res.phoneCountryData) {
        var phoneIsoCode = 'au';
        if(typeof res.phoneCountryData === 'string' && res.phoneCountryData.length){
          phoneIsoCode = JSON.parse(res.phoneCountryData).iso2;
        }else{
          phoneIsoCode = res.phoneCountryData.iso2;
        }
        sessionStorage.setItem('phoneCountryData',  phoneIsoCode);
      }

      if(res.landlineNumberCountryData) {
        var landlineNumberIsoCode = 'au';
        if(typeof res.landlineNumberCountryData === 'string'){
          landlineNumberIsoCode = JSON.parse(res.landlineNumberCountryData).iso2;
        }else{
          landlineNumberIsoCode = res.landlineNumberCountryData.iso2;
        }
        sessionStorage.setItem('landlineNumberCountryData',  landlineNumberIsoCode);
      }
    }

    $('body').on('shown.bs.modal', function(e) {
      setFocusToFormControl(e.target);
    });

    $scope.$on('$viewContentLoaded', function() {
      setFocusToFormControl('body');
    });

    $scope.$on('$includeContentLoaded', function() {
      setFocusToFormControl('body');
    });

    $('.dashboard-header-mobile .nav a').click(function () {
      $('.navbar-collapse').collapse('hide');
      $('.modal').modal('hide');
    });

    function setFocusToFormControl(target) {
      var inputs = $(target).find('.form-control:not(.ng-autofocus-skip):visible');
      if(inputs.length) {
        inputs[0].focus();
      }
    }
  }

  function messagesUtilObject() {
    return {
      sessionBuilder: {
        noContacts: 'There are no contacts selected',
        cantSelect: "You can't select members from this list",
        noMobileForContact: 'The contact has no mobile provided',
        noMobileForContacts: ' contacts has no mobile provided',
        noContactsToInvite: 'You have already sent invitation to selected users',
        noContactsToSendSMS: 'Selected contacts has no mobile provided'
      },
      gallery: {
        noResource: 'No resource selected',
        cantLoad: "Can't load resources"
      },
      contactList: {
        listNameBlank: "Contact list name can't be empty",
        noUsersRemoved: 'No users was removed',
        import: {
          failed: 'Import Failed. Check error(s)',
          corrupted: 'This file media type is not recognized or it is corrupted. Please, choose another file.',
          remapFailed: 'Field Re-Map failed',
          addCustomField: 'Please add name for your custom field.',
          tooManyCustomFields: "Too many custom fields, allowed: "
        }
      },
      upgradePlan: {
        orderCancelled: 'Order was cancelled'
      }
    }
  }
})();
