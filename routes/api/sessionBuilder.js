'use strict';

var MessagesUtil = require('./../../util/messages');
var constants = require('../../util/constants');
var sessionBuilderServices = require('./../../services/sessionBuilder');
var sessionBuilderSnapshotValidationService = require('./../../services/sessionBuilderSnapshotValidation');
var sessionServices = require('./../../services/session');
let topicsService = require('./../../services/topics');
let _ = require('lodash');

module.exports = {
  new: initializeBuilder,
  update: update,
  goToStep: goToStep,
  cancel: cancel,
  openBuild: openBuild,
  sendSms: sendSms,
  inviteMembers: inviteMembers,
  removeInvite: removeInvite,
  sendGenericEmail: sendGenericEmail,
  sendCloseEmail: sendCloseEmail,
  addTopics: addTopics,
  removeTopic: removeTopic,
  sessionMailTemplateStatus: sessionMailTemplateStatus,
  canAddObservers: canAddObservers,
  setAnonymous: setAnonymous
};

function initializeBuilder(req, res, next) {
  let params = { accountId: res.locals.currentDomain.id, date: req.body.date, timeZone: req.body.timeZone };
  sessionBuilderServices.initializeBuilder(params).then(function(result) {
    res.send(result);
  }, function(error) {
    res.send({error: error});
  })
}

function canAddObservers(req, res, next) {
  sessionBuilderServices.canAddObservers(res.locals.currentDomain.id).then(function(result) {
    res.send(result);
  }, function(error) {
    res.send({error: error});
  });
}

function openBuild(req, res, next) {
  let accountId = res.locals.currentDomain.id;
  sessionBuilderServices.openBuild(req.params.id, accountId).then(function(result) {
    res.send(result);
  }, function(error) {
    res.send({error: error});
  })
}

function setAnonymous(req, res, next) {
  let sessionId = req.params.id;
  sessionServices.setAnonymous(sessionId, res.locals.currentDomain.id).then(function(result) {
    res.send(result);
  }, function(error) {
    res.send({error: error});
  });
}
function update(req, res, next) {
  let sessionId = req.params.id;
  let sessionDataObj = req.body;
  sessionBuilderServices.update(sessionId, res.locals.currentDomain.id, sessionDataObj).then(function(result) {
    res.send(result);
  }, function(error) {
    res.send({error: error});
  });
}

function sessionMailTemplateStatus(req, res, next) {
  let sessionId = req.params.id;
  sessionBuilderServices.sessionMailTemplateStatus(sessionId, res.locals.currentDomain.id).then(function(result) {
    res.send(result);
  }, function(error) {
    res.send({error: error});
  });
}

function goToStep(req, res, next) {
  let accountId = res.locals.currentDomain.id;

  sessionBuilderServices.goToStep(req.params.id, accountId, req.params.arg).then(function(result) {
    res.send({ data: result });
  }, function(error) {
    res.send({ error: error });
  })
}

function cancel(req, res, next) {
  sessionBuilderServices.destroy(req.params.id).then(function(result) {
    res.send(result);
  }, function(error) {
    res.send({error: error});
  })
}

function sendSms(req, res, next) {
  sessionBuilderServices.sendSms(res.locals.currentDomain.id, req.body).then(function(result) {
    res.send({ message: result });
  }, function(error) {
    res.send({ error: error });
  });
}

function inviteMembers(req, res, next) {
  let accountId = res.locals.currentDomain.id;
  let accountName = res.locals.currentDomain.name;
  sessionBuilderServices.inviteMembers(req.params.id, req.body, accountId, accountName).then(function(result) {
    res.send({ data: result, message: MessagesUtil.routes.sessionBuilder.invite });
  }, function(error) {
    res.send({ error: error });
  });
}

function removeInvite(req, res, next) {
  let accountId = res.locals.currentDomain.id;
  sessionBuilderServices.removeInvite(req.params, accountId).then(function(message) {
    res.send({ message: message });
  }, function(error) {
    res.send({ error: error });
  });
}

function sendGenericEmail(req, res, next) {
  let accountId = res.locals.currentDomain.id;
  let sessionId = req.params.id;

  sessionBuilderServices.sessionMailTemplateExists(sessionId, accountId, "Generic").then(function(result) {
    sessionBuilderServices.sendGenericEmail(req.params.id, req.body, accountId).then(function(message) {
      res.send({ message: message });
    }, function(error) {
      res.send({ error: error });
    });
  }, function(error) {
    res.send({ genericTemplateNotCreated: true });
  });

}

function sendCloseEmail(req, res, next) {
  let accountId = res.locals.currentDomain.id;
  let sessionId = req.params.id;

  sessionBuilderServices.sessionMailTemplateExists(sessionId, accountId, "Close Session").then(function() {
    sessionBuilderServices.sendCloseEmail(sessionId, req.body, accountId).then(function(message) {
      res.send({ message: message });
    }, function(error) {
      res.send({ error: error });
    });
  }, function(error) {
    res.send({error: error});
  });

}

function addTopics(req, res, next) {
  let accountId = res.locals.currentDomain.id;
  let sessionId = req.params.id;
  let topics = req.body.topicsArray;
  let snapshot = req.body.snapshot;
  if(!topics) { res.send({error:'Required body param @topicsArray is missed'}); return };

  sessionBuilderSnapshotValidationService.isTopicsDataValid(snapshot, sessionId, accountId, topics, sessionBuilderServices).then(function(validationRes) {

    if (validationRes.isValid) {
      topicsService.removeAllAndAddNew(sessionId, topics).then(function(result) {
        sessionBuilderServices.sessionBuilderObjectStepSnapshot(sessionId, accountId, "facilitatiorAndTopics").then(function(snapshotResult) {
          res.send({succuss:true, data:result, snapshot:snapshotResult});
        });
      }, function(error) {
        res.send({ error: error });
      });
    } else {
      res.send({ validation: validationRes });
    }

  }, function (err) {
    res.send({error: err});
  });
}

function removeTopic(req, res, next) {
  let topicId = req.body.topicId;
  var ids = [topicId];
  topicsService.removeFromSession(ids, req.params.id).then(function(result) {
    res.send({succuss:true, data:result});
  }, function(error) {
    res.send({ error: error });
  });
}
