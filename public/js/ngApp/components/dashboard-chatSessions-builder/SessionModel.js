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
      previousStep: {method: 'POST', params: {path: 'step'} }
    });

    var mailRestApi = {
      mailTemplates: $resource(globalSettings.restUrl + '/sessionMailTemplates', {}, {get: {method: 'GET'}})
    };
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
    SessionModel.prototype.close = close;
    SessionModel.prototype.open = open;
    SessionModel.prototype.update = update;


    SessionModel.prototype.goNextStep = goNextStep;
    SessionModel.prototype.goPreviouseStep = goPreviousStep;

    SessionModel.prototype.updateStep = updateStep;
    SessionModel.prototype.sendSms = sendSms;
    SessionModel.prototype.addMembers = addMembers;
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

      (!self.id)
        ? self.createNew().then(function(res) { self.getRemoteData().then(resolve); })
        : self.getRemoteData().then(resolve);

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

    function close() {
      var self = this;
      var deferred = $q.defer();
      self.active = self.sessionData.active = false;
      self.update({active:self.active}).then(
        function (res) {
          deferred.resolve(res);
        },
        function (err) {
          deferred.reject(err);
        }
      );
      return deferred.promise;
    }

    function open() {
      var self = this;
      var deferred = $q.defer();
      self.active = self.sessionData.active = true;
      self.update({active:self.active}).then(
        function (res) {
          deferred.resolve(res)
        },
        function (err) {
          deferred.reject(err);
        }
      );
      return deferred.promise;
    }


    function update(data) {
      var deferred = $q.defer();
      var self = this;

      var step3 = null;

      if (self.currentStep == 'manageSessionParticipants') step3 = true;

      sessionBuilderRestApi.put({id:self.id},{sessionObj:self, step3:step3, data:data},function(res) {
        if (res.error) { deferred.reject(res.error); return deferred.promise; }

        deferred.resolve(res);
      });

      return deferred.promise;

    }

    function goNextStep(step) {
      var deferred = $q.defer();
      var self = this;

      sessionBuilderRestApi.nextStep({id: self.id, otherId: 'next'}, {}, function(res) {
        res.error
          ? deferred.reject(res.error)
          : deferred.resolve(res);
      });

      return deferred.promise;
    }

    function goPreviousStep() {
      var self = this;
      var deferred = $q.defer();

      sessionBuilderRestApi.previousStep({id: self.id, otherId: 'previous'}, {}, function(res) {
        res.error
          ? deferred.reject(res.error)
          : deferred.resolve(res);
      });

      return deferred.promise;
    }

    function updateStep(stepDataObj) {
      var self = this;
      var deferred = $q.defer();

      sessionBuilderRestApi.put({id:self.id}, stepDataObj,function(res) {
        if (res.error) {
          return deferred.reject(res.error);
        }
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


    function addMembers(members, role) {
      var self = this;
      var deferred = $q.defer();
      if (!angular.isArray(members)) members = [members];

      var params = {
        sessionId: self.id,
        role: role,
        members: []
      };

      for (var i = 0, len = members.length; i < len ; i++) {
        params.members[i] = {
          accountUserId: members[i].accountUserId,
          username: members[i].firstName + ' '+ members[i].lastName,
        };
      }

      sessionMemberApi.post({},params,function(res) {
        if (res.error) { deferred.reject(err);  return deferred.promise;}
        deferred.resolve();
      });

      return deferred.promise;
    }

    function saveTopics(topicsArray) {
      var self = this;
      var deferred = $q.defer();

      sessionBuilderRestApi.addTopics({id: self.id}, { topicsArray:self.steps.step2.topics }, function(res) {
        if (res.error) { deferred.reject(err);  return deferred.promise;}

        deferred.resolve(res);
      });
      return deferred.promise;
    }

    function inviteParticipants(members) {
      var self = this;
      var deferred = $q.defer();
      
      sessionBuilderRestApi.inviteMembers({ id: self.id }, { members: members, role: 'participant' }, function(res) {
        if (res.error) {
          deferred.reject(res.error);
        } else {
          deferred.resolve(res);
        }
      });

      return deferred.promise;
    }

    function inviteObservers(members) {
      var self = this;
      var deferred = $q.defer();

      sessionBuilderRestApi.inviteMembers({ id: self.id }, { members: members, role: 'observer' }, function(res) {
        if (res.error) { deferred.reject(err);  return deferred.promise;}

        deferred.resolve(res);
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

    function getAllSessionMailTemplates() {
      var deferred = $q.defer();
      mailRestApi.mailTemplates.get({getSystemMail:getSystemMail}, function (res) {
        if(res.error) {
          return deferred.reject(res.error);
        }
        deferred.resolve(res);
      });

      return deferred.promise;
    }

  }
})();
