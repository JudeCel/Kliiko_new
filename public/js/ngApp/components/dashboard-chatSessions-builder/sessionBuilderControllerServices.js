(function () {
  'use strict';
  angular.module('KliikoApp').factory('sessionBuilderControllerServices', sessionBuilderControllerServices);
  sessionBuilderControllerServices.$inject = ['globalSettings', '$q', '$resource', 'dbg'];

  function sessionBuilderControllerServices(globalSettings, $q, $resource, dbg) {

    var Services = {};

    Services.getDependencies = getDependencies;
    
    return Services;

    function getDependencies() {
      return {
        step2:  [
            '/js/ngApp/components/dashboard-resources-topics/TopicsController.js',
            '/js/ngApp/modules/topicsAndSessions/topicsAndSessions.js'
        ],
        step3: [
          '/js/ngApp/components/dashboard-resources-emailTemplates/EmailTemplateEditorController.js',
          '/js/vendors/ng-file-upload/ng-file-upload.js'
        ],
        step4: [
          '/js/ngApp/components/dashboard-resources-contactLists/contactListsControllerServices.js',
          '/js/ngApp/components/dashboard-resources-contactLists/ContactListsController.js',
          '/js/ngApp/components/dashboard-resources-contactLists/ListsModel.js',
          '/js/ngApp/components/dashboard-resources-contactLists/ListItemModel.js',
          '/js/ngApp/components/dashboard-resources-contactLists/ListItemMemberModel.js',
          '/js/ngApp/modules/contactList/contactList.js',
          '/js/ngApp/directives/custom-select-directive.js',
          '/js/vendors/ng-file-upload/ng-file-upload.js',
          '/js/ngApp/filters/num.js',
          '/js/ngApp/filters/human2Camel.js'
        ],
        step5: [
          '/js/ngApp/components/dashboard-resources-contactLists/contactListsControllerServices.js',
          '/js/ngApp/components/dashboard-resources-contactLists/ContactListsController.js',
          '/js/ngApp/components/dashboard-resources-contactLists/ListsModel.js',
          '/js/ngApp/components/dashboard-resources-contactLists/ListItemModel.js',
          '/js/ngApp/components/dashboard-resources-contactLists/ListItemMemberModel.js',
          '/js/ngApp/modules/contactList/contactList.js',
          '/js/ngApp/directives/custom-select-directive.js',
          '/js/vendors/ng-file-upload/ng-file-upload.js',
          '/js/ngApp/filters/num.js',
          '/js/ngApp/filters/human2Camel.js'
        ]

      }
    }
    }
  
})();
