(function () {
  'use strict';
  angular.module('KliikoApp').factory('surveyServices', surveyServices);
  angular.module('KliikoApp.Root').factory('surveyServices', surveyServices);
  surveyServices.$inject = ['$q', '$resource', 'dbg', 'globalSettings', '$window'];

  function surveyServices($q, $resource, dbg, globalSettings, $window) {
    var surveyRestApi = $resource('/survey/:path', null, {
      update: { method: 'PUT' },
      find: { method: 'GET', params: { path: 'find' } },
      status: { method: 'PUT', params: { path: 'status' } },
      copy: { method: 'POST', params: { path: 'copy' } },
      answer: { method: 'POST', params: { path: 'answer' } },
      confirm: { method: 'PUT', params: { path: 'confirm' } },
      constants: { method: 'GET', params: { path: 'constants' } },
      canExportSurveyData: { method: 'GET', params: { path: 'canExportSurveyData' } },
      getSurveyStats: { method: 'GET', params: { path: 'stats' } },
    });

    var upServices = {};

    upServices.getConstants = getConstants;
    upServices.getAllSurveys = getAllSurveys;
    upServices.findSurvey = findSurvey;
    upServices.removeSurvey = removeSurvey;
    upServices.changeStatus = changeStatus;
    upServices.updateSurvey = updateSurvey;
    upServices.createSurvey = createSurvey;
    upServices.copySurvey = copySurvey;
    upServices.answerSurvey = answerSurvey;
    upServices.confirmSurvey = confirmSurvey;
    upServices.pickValidClass = pickValidClass;
    upServices.checkTag = checkTag;
    upServices.canExportSurveyData = canExportSurveyData;
    upServices.getSurveyStats = getSurveyStats;
    upServices.exportSurveyStatsUrl = exportSurveyStatsUrl;
    upServices.exportSurveyListStatsUrl = exportSurveyListStatsUrl;
    upServices.exportSessionStatsUrl = exportSessionStatsUrl;
    return upServices;

    function getConstants(type) {
      var deferred = $q.defer();
      dbg.log2('#surveyServices > getConstants > make rest call');
      surveyRestApi.constants({surveyType: type}, function(res) {
        dbg.log2('#surveyServices > getConstants > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };

    function canExportSurveyData() {
      var deferred = $q.defer();

      dbg.log2('#surveyServices > canExportSurveyData > make rest call');
      surveyRestApi.canExportSurveyData({}, function(res) {
        dbg.log2('#surveyServices > canExportSurveyData > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    }
    function exportSurveyStatsUrl(surveyId, format) {
      var apiUrl = '/api/surveys/report/'+surveyId+'/'+format+'/';
      return(globalSettings.serverChatDomainUrl + apiUrl + $window.localStorage.getItem("jwtToken"));
    }

    function exportSurveyListStatsUrl(surveyIdList, format) {
      var apiUrl = '/api/surveys/list_report/'+format+'/';
      return (globalSettings.serverChatDomainUrl + apiUrl + $window.localStorage.getItem("jwtToken") +"?ids="+surveyIdList);
    }

    function exportSessionStatsUrl(sessionId, format) {
      var apiUrl = '/api/surveys/session_report/'+sessionId+'/'+format+'/';
      return(globalSettings.serverChatDomainUrl + apiUrl + $window.localStorage.getItem("jwtToken"));
    }

    function getSurveyStats(id) {
      var deferred = $q.defer();

      dbg.log2('#surveyServices > getSurveyStats > make rest call');
      surveyRestApi.getSurveyStats({ id: id }, function(res) {
        dbg.log2('#surveyServices > getSurveyStats > rest call responds');
        deferred.resolve(res);
      }, function(err) {
        dbg.error('#surveyServices > getSurveyStats > error:', err);
        messenger.error(err);
      });

      return deferred.promise;
    }

    function getAllSurveys(data) {
      var deferred = $q.defer();

      dbg.log2('#surveyServices > getAllSurveys > make rest call');
      surveyRestApi.get(data, function(res) {
        dbg.log2('#surveyServices > getAllSurveys > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };

    function findSurvey(data) {
      var deferred = $q.defer();

      dbg.log2('#surveyServices > findSurvey > make rest call');
      surveyRestApi.find(data, function(res) {
        dbg.log2('#surveyServices > findSurvey > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };

    function removeSurvey(data) {
      var deferred = $q.defer();

      dbg.log2('#surveyServices > removeSurvey > make rest call');
      surveyRestApi.delete(data, function(res) {
        dbg.log2('#surveyServices > removeSurvey > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };

    function changeStatus(data) {
      var deferred = $q.defer();

      dbg.log2('#surveyServices > changeStatus > make rest call');
      surveyRestApi.status(data, function(res) {
        dbg.log2('#surveyServices > changeStatus > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };

    function updateSurvey(data) {
      var deferred = $q.defer();

      dbg.log2('#surveyServices > updateSurvey > make rest call');
      surveyRestApi.update(data, function(res) {
        dbg.log2('#surveyServices > updateSurvey > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };

    function createSurvey(data) {
      var deferred = $q.defer();

      dbg.log2('#surveyServices > createSurvey > make rest call');
      surveyRestApi.save(data, function(res) {
        dbg.log2('#surveyServices > createSurvey > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };

    function copySurvey(data) {
      var deferred = $q.defer();

      dbg.log2('#surveyServices > copySurvey > make rest call');
      surveyRestApi.copy(data, function(res) {
        dbg.log2('#surveyServices > copySurvey > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };

    function answerSurvey(data) {
      var deferred = $q.defer();

      dbg.log2('#surveyServices > answerSurvey > make rest call');
      surveyRestApi.answer(data, function(res) {
        dbg.log2('#surveyServices > answerSurvey > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };

    function confirmSurvey(data) {
      var deferred = $q.defer();

      dbg.log2('#surveyServices > confirmSurvey > make rest call');
      surveyRestApi.confirm(data, function(res) {
        dbg.log2('#surveyServices > confirmSurvey > rest call responds');
        deferred.resolve(res);
      });

      return deferred.promise;
    };

    function pickValidClass(error, className) {
      return className + (error && Object.keys(error).length > 0 ? '-danger' : '-success');
    };

    function checkTag(obj, setTagObj) {
      if (setTagObj) {
        setTagObj.tagHandled = false;
      }
      if (obj.handleTag) {
        var elements = document.getElementsByClassName(obj.handleTag);
        if (elements.length > 0) {
          var res = elements[0].checked;
          if (res) {
            setTagObj.tagHandled = true;
          }
          return res;
        } else {
          return false;
        }
      } else {
        return true;
      }
    }


  };
})();
