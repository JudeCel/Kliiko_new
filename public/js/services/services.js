/**
 * Created by alex.sitdikov on 13.11.2015.
 */
'use strict';

/* Services */

angular.module('kliikoServices', ['ngResource']).factory('', ['$resource',
    function($resource){
        return $resource('', {}, {
            query: {method:'GET', params:{id:''}, isArray:true}
        });
    }]);
