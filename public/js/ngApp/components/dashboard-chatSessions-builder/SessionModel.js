(function () {
  'use strict';

  /**
   * Table, that can have dynamics rows
   */
  angular.module('KliikoApp').factory('SessionModel', SessionModel);

  SessionModel.$inject = ['$q', 'globalSettings', '$resource'];
  function SessionModel($q, globalSettings, $resource)  {
    var apiPath = globalSettings.restUrl+'/sessionBuilder/:id/:path/:otherId';
    var sessionBuilderRestApi = $resource(apiPath, { id : '@id', otherId: '@otherId' }, {
      post: { method: 'POST' },
      put: { method: 'PUT' },
      sendSms: { method: 'POST', params: { path: 'sendSms' } },
      inviteMembers: { method: 'POST', params: { path: 'invite' } },
      removeInvite: { method: 'DELETE', params: { path: 'removeInvite' } },
      removeSessionMember: { method: 'DELETE', params: { path: 'removeSessionMember' } },
      sendGenericEmail: { method: 'POST', params: { path: 'sendGenericEmail' } },
      addTopics: {method: 'POST', isArray: true , params: {path: 'addTopics'} },

      nextStep: {method: 'POST', params: {path: 'step'} },
      previousStep: {method: 'POST', params: {path: 'step%2Fprevious'} },

    });

    var chatSessionApi = $resource(globalSettings.restUrl + '/session/:id', null, {
      get: { method: 'get', params: { id: 'list' } },
      copy: { method: 'post', params: { id: '@id' } },
      remove: { method: 'delete', params: { id: '@id' } }
    });

    var sessionMemberApi = $resource(globalSettings.restUrl + '/sessionMember', {}, {
      post: { method: 'POST' , isArray: true }
    });


    var SessionModel;

    SessionModel = SessionModel;
    SessionModel.prototype.init = init;
    SessionModel.prototype.createNew = createNew;
    SessionModel.prototype.getRemoteData = getRemoteData;
    SessionModel.prototype.cancel = cancel;
    SessionModel.prototype.update = update;
    SessionModel.prototype.validateStep = validateStep;
    SessionModel.prototype.goToNextStep = goToNextStep;
    //SessionModel.prototype.destroy = update;
    SessionModel.prototype.destroy = cancel;
    SessionModel.prototype.updateStep = updateStep;
    SessionModel.prototype.sendSms = sendSms;
    SessionModel.prototype.addMember = addMember;
    SessionModel.prototype.saveTopics = saveTopics;
    SessionModel.prototype.inviteParticipants = inviteParticipants;
    SessionModel.prototype.inviteObservers = inviteObservers;
    SessionModel.prototype.removeMember = removeMember;
    SessionModel.prototype.sendGenericEmail = sendGenericEmail;


    return SessionModel;


    /**
     * Init the model
     * @param params {object}
     *
     * @constructor
     */
    function SessionModel(params) {
      var self = this;

      var params = params || {};
      self.id = null;
      if (arguments && arguments.length && arguments.length == 1) {
        self.id = arguments[0];
      } else {
        //get all properties
        for (var p in params) {
          if (params.hasOwnProperty(p)) self[p] = params[p];
        }
      }


    }

    function init() {
      var self = this;
      var deferred = $q.defer();

      if (!self.id) self.createNew().then(resolve);
      if (self.id) self.getRemoteData().then(resolve);

      return deferred.promise;

      function resolve(res) {
        deferred.resolve(res);
      }


    }

    function createNew() {
      var self = this;

      var deferred = $q.defer();
      sessionBuilderRestApi.post({},{},function(res) {
        if (res.error) { deferred.reject(res.error); return deferred.promise; }
        self = angular.merge(self, res.sessionBuilder);
        deferred.resolve(res);
      });

      return deferred.promise;
    }

    function getRemoteData() {
      var self = this;
      var deferred = $q.defer();
      sessionBuilderRestApi.get({id:self.id}, {}, function(res) {
        self = angular.merge(self, res.sessionBuilder);

        // get current session data
        chatSessionApi.get({}, function(sessionApiRes) {
          self.chatRoomUrl = sessionApiRes.chatRoomUrl;

          for (var i = 0, len = sessionApiRes.data.length; i < len ; i++) {
            if (sessionApiRes.data[i].id == self.id) {
              self.sessionData = sessionApiRes.data[i];
              break;
            }
          }
          deferred.resolve();
        });

      });

      return deferred.promise;
    }

    function cancel() {
      var self = this;
      var deferred = $q.defer();
      sessionBuilderRestApi.delete({id: self.id},{},function(res) {
        deferred.resolve(res);
      });

      return deferred.promise;
    }

    function update() {
      console.log('will update - todo');
      var self = this;
      var deferred = $q.defer();

      sessionBuilderRestApi.put({id:self.id},{sessionObj:self},function(res) {
        if (res.error) { deferred.reject(res.error); return deferred.promise; }
        //self = angular.merge(self, res.sessionBuilder);
        deferred.resolve(res);
      });

    }


    function validateStep(step) {
      var deferred = $q.defer();
      var self = this;

      sessionBuilderRestApi.nextStep({id: self.id, otherId: 'next'}, {}, function(res) {
        deferred.resolve(res);
      });

      return deferred.promise;
    }

    function goToNextStep() {

    }


    function updateStep() {
      var self = this;
      var deferred = $q.defer();

      sessionBuilderRestApi.put({id:self.id},{sessionObj:self},function(res) {
        if (res.error) { deferred.reject(res.error); return deferred.promise; }
        deferred.resolve(res);
      });

      return deferred.promise;

    }


    function sendSms(recievers, message) {
      var self = this;
      var deferred = $q.defer();

      sessionBuilderRestApi.sendSms({ id: self.id }, { recievers: recievers, message: message }, function(res) {
        if(res.error) {
          deferred.reject(res.error);
        }
        else deferred.resolve(res.message);
      });

      return deferred.promise;
    }


    function addMember(member, role) {
      var self = this;

      var deferred = $q.defer();
      var params = {
        sessionId: self.id,
        accountUserId: member.accountUserId,
        username: member.firstName + ' '+member.lastName,
        role: role

      };
      sessionMemberApi.post({},params,function(res) {
        deferred.resolve();
      });

      return deferred.promise;
    }

    function saveTopics(topicsArray) {
      var self = this;
      var deferred = $q.defer();


      sessionBuilderRestApi.addTopics({id: self.id}, { topicsArray:self.steps.step2.topics }, function(res) {
        deferred.resolve(res);
      });
      return deferred.promise;
    }

    function inviteParticipants(members) {
      var self = this;
      var deferred = $q.defer();

      sessionBuilderRestApi.inviteMembers({ id: self.id }, { members: members, role: 'participant' }, function(res) {
        if(res.error) {
          deferred.reject(res.error);
        }
        else deferred.resolve(res);
      });

      return deferred.promise;
    }

    function inviteObservers(members) {
      var self = this;
      var deferred = $q.defer();

      sessionBuilderRestApi.inviteMembers({ id: self.id }, { members: members, role: 'observer' }, function(res) {
        if(res.error) {
          deferred.reject(res.error);
        }
        else deferred.resolve(res);
      });

      return deferred.promise;
    }

    function removeMember(member) {
      var self = this;
      var deferred = $q.defer();

      if(member.invite) {
        sessionBuilderRestApi.removeInvite({ id: self.id, otherId: member.invite.id }, function(res) {
          if(res.error) {
            deferred.reject(res.error);
          }
          else deferred.resolve(res);
        });
      }
      else {
        sessionBuilderRestApi.removeSessionMember({ id: self.id, otherId: member.sessionMember.id }, function(res) {
          if(res.error) {
            deferred.reject(res.error);
          }
          else deferred.resolve(res);
        });
      }

      return deferred.promise;
    }

    function sendGenericEmail(members) {
      var self = this;
      var deferred = $q.defer();

      sessionBuilderRestApi.sendGenericEmail({ id: self.id }, { recievers: members }, function(res) {
        if(res.error) {
          deferred.reject(res.error);
        }
        else deferred.resolve(res);
      });

      return deferred.promise;
    }


  }
})();
