(function () {
  'use strict';

  /**
   * Table, that can have dynamics rows
   */
  angular.module('KliikoApp').factory('SessionModel', SessionModel);

  SessionModel.$inject = ['$q', 'globalSettings', '$resource', 'fileUploader', '$confirm'];
  function SessionModel($q, globalSettings, $resource, fileUploader, $confirm)  {
    var apiPath = globalSettings.restUrl+'/sessionBuilder/:id/:path/:arg';
    var sessionBuilderRestApi = $resource(apiPath, { id : '@id', arg: '@arg' }, {
      post: { method: 'POST' },
      put: { method: 'PUT' },
      sendSms: { method: 'POST', params: { path: 'sendSms' } },
      inviteMembers: { method: 'POST', params: { path: 'invite' } },
      removeInvite: { method: 'DELETE', params: { path: 'removeInvite' } },
      sendGenericEmail: { method: 'POST', params: { path: 'sendGenericEmail' } },
      sendCloseEmail: { method: 'POST', params: { path: 'sendCloseEmail' } },
      setAnonymous: { method: 'POST', params: { path: 'setAnonymous' } },
      sessionMailTemplateStatus: { method: 'GET', params: { path: 'sessionMailTemplateStatus' } },
      addTopics: {method: 'POST',  params: {path: 'addTopics'} },
      removeTopic: {method: 'POST',  params: {path: 'removeTopic'} },
      certainStep: {method: 'POST', params: {path: 'step'} }
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
    SessionModel.prototype.setAnonymous = setAnonymous;
    SessionModel.prototype.goCertainStep = goCertainStep;
    SessionModel.prototype.updateStep = updateStep;
    SessionModel.prototype.sendSms = sendSms;
    SessionModel.prototype.addMembers = addMembers;
    SessionModel.prototype.saveTopics = saveTopics;
    SessionModel.prototype.inviteParticipants = inviteParticipants;
    SessionModel.prototype.inviteObservers = inviteObservers;
    SessionModel.prototype.removeMember = removeMember;
    SessionModel.prototype.sendGenericEmail = sendGenericEmail;
    SessionModel.prototype.sendCloseEmail = sendCloseEmail;
    SessionModel.prototype.processStepResponse = processStepResponse;
    SessionModel.prototype.removeTopic = removeTopic;
    SessionModel.prototype.getSessionMailTemplateStatus = getSessionMailTemplateStatus;

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
      self.socket = null;
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

      function resolve(res) {
        deferred.resolve(res);
      }

      function reject(err) {
        deferred.reject(err);
      }

      return deferred.promise;
    }

    function getSessionMailTemplateStatus() {
      var self = this;
      var deferred = $q.defer();
      sessionBuilderRestApi.sessionMailTemplateStatus({id: self.id}, {}, function(res) {
        if (res.error) {
          deferred.reject(res.error);
        } else {
          deferred.resolve(res);
        }
      });

      return deferred.promise;
    }

    function initializeDate() {
      var date = new Date();
      date.setHours(0, 0, 0, 0);
      return date;
    }

    function createNew() {
      var self = this;

      var deferred = $q.defer();
      sessionBuilderRestApi.post({},{ date: initializeDate().toString(), timeZone: jstz.determine().name() },function(res) {
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
        if (res.error) {
          deferred.reject(res.error);
        } else {
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

    function setOpen(status) {
      var self = this;
      var deferred = $q.defer();
      self.updateStep({status: status}).then(
        function (res) {
          if (!res.ignored) {
            self.status = self.sessionData.status = status;
            self.currentStep = self.sessionData.step = res.sessionBuilder.currentStep;
          }
          deferred.resolve(res);
        },
        function (err) {
          deferred.reject(err);
        }
      );
      return deferred.promise;
    }

    function setAnonymous() {
      var self = this;
      var deferred = $q.defer();

      sessionBuilderRestApi.setAnonymous({ id: self.id },function(res) {
        if (res.error) {
          deferred.reject(res.error);
        } else {
          deferred.resolve(res);
        }
      });
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

    function goCertainStep(step) {
      var deferred = $q.defer();
      var self = this;

      sessionBuilderRestApi.certainStep({id: self.id, arg: step}, {}, function(res) {
        self.processStepResponse(res, deferred);
      });

      return deferred.promise;
    }

    function updateStep(stepDataObj, selfParam) {
      var self = selfParam || this;
      var deferred = $q.defer();

      if (!stepDataObj.snapshot) {
        stepDataObj.snapshot = self.snapshot;
      }

      sessionBuilderRestApi.put({id:self.id}, stepDataObj, function(res) {
        if (res.error) {
          deferred.reject(res.error);
        } else if (res.validation && !res.validation.isValid) {
          updateValidationConfirm(res, self.updateStep, stepDataObj, self).then(function(newRes) {
            deferred.resolve(newRes);
          }, function(err) {
            deferred.reject(err);
          });
        } else {
          self.sessionData.showStatus = res.sessionBuilder.showStatus;
          self.steps = res.sessionBuilder.steps;
          self.snapshot = res.sessionBuilder.snapshot;
          deferred.resolve(res);
        }
      });

      return deferred.promise;
    }

    function updateValidationConfirm(res, saveAgainCallback, data, self) {
      var deferred = $q.defer();

      updateValidationConfirmDialog(res.validation, function() {
        if (res.validation.fieldName) {
          data.snapshot[res.validation.fieldName] = res.validation.currentValueSnapshot;
        }
        if (res.validation.currentSnapshotChanges) {
          angular.merge(data.snapshot, res.validation.currentSnapshotChanges);
        }
        saveAgainCallback(data, self).then(function(newRes) {
          deferred.resolve(newRes);
        });
      }, function() {
        self.getRemoteData().then(function() {
          deferred.resolve({ ignored: true });
        });
      });

      return deferred.promise;
    }

    function updateValidationConfirmDialog(validation, saveMineCallback, saveTheirsCallback) {
      if (validation.canChange) {
        $confirm({ 
          text: "What are the odds of you and someone else editing the same thing at the same time... so which edit do you want saved?", 
          title: "Yikes!", 
          cancel: "Save Theirs", 
          ok: "Save Mine",
          choice: true, 
        }).then(function() {
          saveMineCallback();
        }, function() {
          saveTheirsCallback();
        });
      } else {
        $confirm({ 
          text: "Sorry, you can not change this option anymore, because it was already changed by someone else.", 
          title: "Yikes!", 
          closeOnly: true 
        }).then(function() {
          saveTheirsCallback();
        }, function() {
          saveTheirsCallback();
        });
      }
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
      var deferred = $q.defer();
      var params = {
        sessionId: this.id,
        role: role,
        username: member.firstName,
        accountUserId: member.accountUserId,
        snapshot: this.snapshot
      }
      addMembersByParams(params, this).then(function(res) {
        deferred.resolve(res);
      }, function(err) {
        deferred.reject(err);
      });
      return deferred.promise;
    }

    function addMembersByParams(params, self) {
      var deferred = $q.defer();

      sessionMemberApi.post({}, params, function(res) {
        if (res.error) { 
          deferred.reject(res.error);  
        } else if (res.validation && !res.validation.isValid) {

          updateValidationConfirm(res, addMembersByParams, params, self).then(function(newRes) {
            deferred.resolve(newRes);
          }, function(err) {
            deferred.reject(err);
          });

        } else {
          deferred.resolve(res);
        }
      });

      return deferred.promise;
    }

    function saveTopics(topicsArray) {
      var deferred = $q.defer();

      var params = {
        topicsArray: topicsArray, 
        snapshot: this.snapshot
      }
      saveTopicsByParams(params, this).then(function(res) {
        deferred.resolve(res);
      }, function(err) {
        deferred.reject(err);
      });

      return deferred.promise;
    }

    function saveTopicsByParams(params, self) {
      var deferred = $q.defer();

      sessionBuilderRestApi.addTopics({id: self.id}, params, function(res) {
        if (res.error) { 
          deferred.reject(res.error);  
        } else if (res.validation && !res.validation.isValid) {

          updateValidationConfirm(res, saveTopicsByParams, params, self).then(function(newRes) {
            deferred.resolve(newRes);
          }, function(err) {
            deferred.reject(err);
          });

        } else {
          self.snapshot = res.snapshot;
          deferred.resolve(res.data);
        }
      });

      return deferred.promise;
    }

    function removeTopic(topicId) {
      var self = this;
      var deferred = $q.defer();
      sessionBuilderRestApi.removeTopic({id: self.id}, { topicId: topicId }, function(res) {
        if (res.error) {
          deferred.reject(res.error);
        } else {
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
        if (res.error) {
          deferred.reject(res.error);
        } else {
          deferred.resolve(res);
        }
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
          }else {
            deferred.resolve(res);
          }
        });
      };
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

    function sendCloseEmail(members) {
      var self = this;
      var deferred = $q.defer();

      sessionBuilderRestApi.sendCloseEmail({ id: self.id }, { recievers: members }, function(res) {
        if (res.error) {
          deferred.reject(res.error);
        } else {
          deferred.resolve(res);
        }
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
