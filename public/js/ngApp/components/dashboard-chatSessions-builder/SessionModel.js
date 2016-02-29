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
      removeSessionMember: { method: 'DELETE', params: { path: 'removeSessionMember' } }
    });

    var SessionModel;

    SessionModel = SessionModel;
    SessionModel.prototype.init = init;
    SessionModel.prototype.createNew = createNew;
    SessionModel.prototype.getRemoteData = getRemoteData;
    SessionModel.prototype.cancel = cancel;
    SessionModel.prototype.destroy = update;
    SessionModel.prototype.updateStep = updateStep;
    SessionModel.prototype.sendSms = sendSms;
    SessionModel.prototype.inviteParticipants = inviteParticipants;
    SessionModel.prototype.inviteObservers = inviteObservers;
    SessionModel.prototype.removeMember = removeMember;


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

      //self.init();

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
        deferred.resolve();
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
      //debugger; //debugger
      sessionBuilderRestApi.put({id:self.id},{sessionObj:self},function(res) {
        if (res.error) { deferred.reject(res.error); return deferred.promise; }
        //self = angular.merge(self, res.sessionBuilder);
        deferred.resolve(res);
      });

    }

    function updateStep() {
      console.log('will update - todo');
      var self = this;
      var deferred = $q.defer();
     // debugger; //debugger
      sessionBuilderRestApi.put({id:self.id},{sessionObj:self},function(res) {
        if (res.error) { deferred.reject(res.error); return deferred.promise; }
        //self = angular.merge(self, res.sessionBuilder);
        deferred.resolve(res);
      });
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


  }
})();
