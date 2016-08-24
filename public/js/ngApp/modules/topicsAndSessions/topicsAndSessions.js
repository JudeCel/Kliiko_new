(function () {
  'use strict';

  angular.module('topicsAndSessions', [])
    .factory('topicsAndSessions', topicsAndSessionsFactory);

  topicsAndSessionsFactory.$inject = ['dbg', 'globalSettings','$q', '$resource'];
  function topicsAndSessionsFactory(dbg, globalSettings, $q, $resource) {
    var restApi = {
      topics: $resource(globalSettings.restUrl +'/topics'),
      topic: $resource(globalSettings.restUrl +'/topic/:id', {id:'@id'}, {post: {method: 'POST'}, put: {method: 'PUT'}}),
      sessionTopic: $resource(globalSettings.restUrl +'/topic/updateSessionTopicName', {id:'@id'}, {put: {method: 'PUT'}}),
      sessionByInvite: $resource(globalSettings.restUrl +'/session/getByInvite', {}, {post: {method: 'POST'}, put: {method: 'PUT'}})
    };

    var topicsAndSessionsFactory = {};
    topicsAndSessionsFactory.getAllTopics = getAllTopics;
    topicsAndSessionsFactory.createNewTopic = createNewTopic;
    topicsAndSessionsFactory.updateTopic = updateTopic;
    topicsAndSessionsFactory.deleteTopic = deleteTopic;
    topicsAndSessionsFactory.getSessionByInvite = getSessionByInvite;
    topicsAndSessionsFactory.updateSessionTopicName = updateSessionTopicName;

    return topicsAndSessionsFactory;

    function updateSessionTopicName(params) {
      var deferred = $q.defer();

      restApi.sessionTopic.put({}, params, function(result) {
        if(result.error) {
          deferred.reject(result.error);
        }else{
          deferred.resolve(result);
        }
      })

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
          ? deferred.reject(res.error)
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
          ? deferred.reject(res.error)
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
