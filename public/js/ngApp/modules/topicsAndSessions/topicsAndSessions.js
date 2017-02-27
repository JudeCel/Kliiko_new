(function () {
  'use strict';

  angular.module('topicsAndSessions', [])
    .factory('topicsAndSessions', topicsAndSessionsFactory);

  topicsAndSessionsFactory.$inject = ['dbg', 'globalSettings','$q', '$resource', 'changesValidation'];
  function topicsAndSessionsFactory(dbg, globalSettings, $q, $resource, changesValidation) {
    var restApi = {
      topics: $resource('/topics'),
      topic: $resource('/topic/:id', {id:'@id'}, {post: {method: 'POST'}, put: {method: 'PUT'}}),
      sessionTopic: $resource('/topic/updateSessionTopic', {id:'@id'}, {put: {method: 'PUT'}}),
      sessionByInvite: $resource('/session/getByInvite', {}, {post: {method: 'POST'}, put: {method: 'PUT'}})
    };

    var topicsAndSessionsFactory = {};
    topicsAndSessionsFactory.getAllTopics = getAllTopics;
    topicsAndSessionsFactory.createNewTopic = createNewTopic;
    topicsAndSessionsFactory.updateTopic = updateTopic;
    topicsAndSessionsFactory.deleteTopic = deleteTopic;
    topicsAndSessionsFactory.getSessionByInvite = getSessionByInvite;
    topicsAndSessionsFactory.updateSessionTopic = updateSessionTopic;

    return topicsAndSessionsFactory;

    function updateSessionTopic(params, session) {
      var deferred = $q.defer();

      if (!params.snapshot) {
        params.snapshot = session.snapshot;
      }

      restApi.sessionTopic.put({}, params, function(result) {
        if (result.error) {
          deferred.reject(result.error);
        } else if (result.validation && !result.validation.isValid) {
          changesValidation.validationConfirm(result, updateSessionTopic, params, session).then(function(newRes) {
            deferred.resolve(newRes);
          }, function(err) {
            deferred.reject(err);
          });
        } else {
          if (result.snapshot) {
            session.snapshot = result.snapshot;
            params.snapshot = null;
          }
          deferred.resolve(result.data);
        }
      });

      return deferred.promise;
    }

    /**
     * Get all topics list
     * @returns {* | Array }
     */
    function getAllTopics() {
      var deferred = $q.defer();

      dbg.log2('#topicsAndSessions > getAllTopics > call to API');
      restApi.topics.get(success, error);

      return deferred.promise;

      function success(res) {
        dbg.log2('#topicsAndSessions > getAllTopics > call to API > success');

        res.error
          ? deferred.reject(res.error)
          : deferred.resolve(res);
      }

      function error(err) {
        dbg.error('#topicsAndSessions > getAllTopics > call to API > connection error');
        deferred.reject('Connection error');
      }

    }

    /**
     * Create new topic
     * @param topicObj {object}
     * @returns {*}
     */
    function createNewTopic(topicObj) {
      var deferred = $q.defer();

      dbg.log2('#topicsAndSessions > createNewTopic > call to API');

      restApi.topic.post({}, {topic: topicObj}, success, error);

      return deferred.promise;

      function success(res) {
        dbg.log2('#topicsAndSessions > createNewTopic > call to API > success');

        res.error
          ? deferred.reject(res.error.message || res.error)
          : deferred.resolve(res);
      }

      function error(err) {
        dbg.error('#topicsAndSessions > createNewTopic > call to API > connection error');
        deferred.reject('Connection error');
      }

    }

    function updateTopic(topicObj) {
      var deferred = $q.defer();

      dbg.log2('#topicsAndSessions > updateTopic > call to API');

      restApi.topic.put({id: topicObj.id}, {topic: topicObj}, success, error);

      return deferred.promise;

      function success(res) {
        dbg.log2('#topicsAndSessions > updateTopic > call to API > success');

        res.error
          ? deferred.reject(res.error.message || res.error)
          : deferred.resolve(res);
      }
      function error(err) {
        dbg.error('#topicsAndSessions > updateTopic > call to API > connection error');
        deferred.reject('Connection error');
      }
    }

    /**
     * Delete topic by Id
     * @param topicId {number | string} or number only? @dianis
     * @returns {*}
     */
    function deleteTopic(topicId) {
      var deferred = $q.defer();

      dbg.log2('#topicsAndSessions > deleteTopic > call to API');

      restApi.topic.delete({id: topicId}, {}, success, error);

      return deferred.promise;

      function success(res) {
        dbg.log2('#topicsAndSessions > deleteTopic > call to API > success');

        res.error
          ? deferred.reject(res.error)
          : deferred.resolve(res);
      }

      function error(err) {
        dbg.error('#topicsAndSessions > deleteTopic > call to API > connection error');
        deferred.reject('Connection error');
      }

    }


    function getSessionByInvite(token) {
      var deferred = $q.defer();

      restApi.sessionByInvite.post({}, {token: token}, function(res) {
        if (res.error) {
          return deferred.reject(res.error);
        }
        deferred.resolve(res);
      });

      return deferred.promise;
    }

  }


})();
