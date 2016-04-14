(function () {
  'use strict';

  /**
   * Table, that can have dynamics rows
   */
  angular.module('KliikoApp').factory('SessionModel', SessionModel);

  SessionModel.$inject = ['$q', 'globalSettings', '$resource'];
  function SessionModel($q, globalSettings, $resource)  {
    var apiPath = globalSettings.restUrl+'/sessionBuilder/:id/:path/:arg';
    var sessionBuilderRestApi = $resource(apiPath, { id : '@id', arg: '@arg' }, {
      post: { method: 'POST' },
      put: { method: 'PUT' },
      sendSms: { method: 'POST', params: { path: 'sendSms' } },
      inviteMembers: { method: 'POST', params: { path: 'invite' } },
      removeInvite: { method: 'DELETE', params: { path: 'removeInvite' } },
      removeSessionMember: { method: 'DELETE', params: { path: 'removeSessionMember' } },
      sendGenericEmail: { method: 'POST', params: { path: 'sendGenericEmail' } },
      addTopics: {method: 'POST',  params: {path: 'addTopics'} },

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

    var sessionMemberApi = $resource(globalSettings.restUrl + '/sessionMember/:path', {}, {
      post: { method: 'POST', params: { path: 'addFacilitator' } }
    });


    var SessionModel;

    SessionModel = SessionModel;
    SessionModel.prototype.init = init;
    SessionModel.prototype.createNew = createNew;
    SessionModel.prototype.getRemoteData = getRemoteData;
    SessionModel.prototype.setOpen = setOpen;
  //  SessionModel.prototype.update = update;

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
    SessionModel.prototype.processStepResponse = processStepResponse;


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

      if (!self.id) {
          self.createNew().then( function(res) {
            self.getRemoteData().then(resolve, reject);
          }, reject);
      } else {
        self.getRemoteData().then(resolve, reject);
      }

      return deferred.promise;

      function resolve(res) {
        deferred.resolve(res);
      }

      function reject(err) {
        deferred.reject(err);
      }

    }

    function createNew() {
      var self = this;

      var deferred = $q.defer();
      sessionBuilderRestApi.post({},{},function(res) {
        if (res.error) {
          deferred.reject(res.error);
        }
        self = angular.merge(self, res.sessionBuilder);
        deferred.resolve(res);
      });

      return deferred.promise;
    }

    function getRemoteData() {
      var self = this;
      var deferred = $q.defer();
      sessionBuilderRestApi.get({id:self.id}, {}, function(res) {
        if(res.error){
          deferred.reject(res.error);
        }else{
          self.sessionData = angular.merge(self, res.sessionBuilder);
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

        }


      });

      return deferred.promise;
    }

    function setOpen(open) {
      var self = this;
      var deferred = $q.defer();
      self.updateStep({active: open}).then(
        function (res) {
          self.active = self.sessionData.active = open;
          deferred.resolve(res)
        },
        function (err) {
          deferred.reject(err);
        }
      );
      return deferred.promise;
    }

    function processStepResponse(res, deferred) {
      var self = this;
      if (res.error) {
        deferred.reject(res.error);
      } else {
        self.getRemoteData().then(function() {
          deferred.resolve(res);
        });
      }
    }

    function goNextStep(step) {
      var deferred = $q.defer();
      var self = this;

      sessionBuilderRestApi.nextStep({id: self.id, arg: 'next'}, {}, function(res) {
        self.processStepResponse(res, deferred);
      });

      return deferred.promise;
    }

    function goPreviousStep() {
      var self = this;
      var deferred = $q.defer();

      sessionBuilderRestApi.previousStep({id: self.id, arg: 'previous'}, {}, function(res) {
        self.processStepResponse(res, deferred);
      });

      return deferred.promise;
    }

    function updateStep(stepDataObj) {
      var self = this;
      var deferred = $q.defer();

      sessionBuilderRestApi.put({id:self.id}, stepDataObj,function(res) {
        if (res.error) {
          deferred.reject(res.error);
        } else {
          deferred.resolve(res);
        }
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


    function addMembers(member, role) {
      var self = this;
      var deferred = $q.defer();
      var params = {
        sessionId: self.id,
        role: role,
        username: member.firstName,
        accountUserId: member.accountUserId
      }

      sessionMemberApi.post({},params,function(res) {
        if (res.error) { deferred.reject(res.error);  return deferred.promise;}
        deferred.resolve();
      });

      return deferred.promise;
    }

    function saveTopics(topicsArray) {
      var self = this;
      var deferred = $q.defer();
      sessionBuilderRestApi.addTopics({id: self.id}, { topicsArray: topicsArray }, function(res) {
        if (res.error) {
          deferred.reject(res.error);
        } else {
          self.steps.step2.topics = topicsArray
          deferred.resolve(res.data);
        }
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
        sessionBuilderRestApi.removeInvite({ id: self.id, arg: member.invite.id }, function(res) {
          if(res.error) {
            deferred.reject(res.error);
          }
          else deferred.resolve(res);
        });
      }
      else {
        sessionBuilderRestApi.removeSessionMember({ id: self.id, arg: member.id }, function(res) {
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
