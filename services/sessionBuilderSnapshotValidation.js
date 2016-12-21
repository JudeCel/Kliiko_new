'use strict';

var constants = require('./../util/constants');
var _ = require('lodash');
var stringHelpers = require('./../util/stringHelpers');
var bluebird = require('bluebird');

// Exports
module.exports = {
  isDataValid: isDataValid,
  isFacilitatorDataValid: isFacilitatorDataValid, 
  isTopicsDataValid: isTopicsDataValid
};

function isDataValid(snapshot, params, session) {
  for (let i=0; i<constants.sessionBuilderValidateChanges.session.notChangableFields.length; i++) {
    let fieldName = constants.sessionBuilderValidateChanges.session.notChangableFields[i];
    if (params[fieldName]) {
      if (params[fieldName] == session[fieldName]) {
        return { isValid: true };
      } else {
        let oldValueSnapshot = snapshot[fieldName];
        let currentValueSnapshot = stringHelpers.hash(session[fieldName]);
        return { isValid: currentValueSnapshot == oldValueSnapshot, canChange: false, fieldName: fieldName, currentValueSnapshot: currentValueSnapshot };
      }
    }
  }

  for (let i=0; i<constants.sessionBuilderValidateChanges.session.changableFields.length; i++) {
    let fieldName = constants.sessionBuilderValidateChanges.session.changableFields[i];
    if (params[fieldName]) {
      if (params[fieldName] == session[fieldName]) {
        return { isValid: true };
      } else {
        let oldValueSnapshot = snapshot[fieldName];
        let currentValueSnapshot = stringHelpers.hash(session[fieldName]);
        return { isValid: currentValueSnapshot == oldValueSnapshot, canChange: true, fieldName: fieldName, currentValueSnapshot: currentValueSnapshot };
      }
    }
  }

  return { isValid: true };
}

function isFacilitatorDataValid(snapshot, facilitatorId, sessionId, sessionBuilderService) {
  return new bluebird(function (resolve, reject) {
    sessionBuilderService.searchSessionMembers(sessionId, 'facilitator').then(function(members) {
      if(!_.isEmpty(members)) {
        let facilitator = members[0];
        if (facilitatorId == facilitator.id) {
          resolve({ isValid: true });
        } else {
          let currentValueSnapshot = stringHelpers.hash(facilitator.id);
          resolve({ isValid: currentValueSnapshot == snapshot.facilitatorId, canChange: true, fieldName: "facilitatorId", currentValueSnapshot: currentValueSnapshot });
        }
      } else {
        resolve({ isValid: true });
      }
    }, function(error) {
      reject(error);
    });
  });
}

function getTopicsSnapshotWithoutProperties(snapshot) {
  let ids = Object.keys(snapshot);
  for (let i=0; i<ids.length; i++) {
    let id = ids[i];
    let values = Object.keys(snapshot[id]);
    for (let i2=0; i2<values.length; i2++) {
      let value = values[i2];
      if (constants.sessionBuilderValidateChanges.topic.listFields.indexOf(value) == -1) {
        delete snapshot[id][value];
      }
    }
  }
  return snapshot;
}

function getSessionTopic(topics, id) {
  for (let i=0; i<topics.length; i++) {
    if (topics[i].id == id) {
      return topics[i].sessionTopic;
    }
  }
  return { };
}

function isTopicDataValid(currentSnapshot, oldSnapshot, topics, id) {
  if (!(id in currentSnapshot)) {
    return false;
  }
  let sessionTopic = getSessionTopic(topics, id);
  for (let i=0; i<constants.sessionBuilderValidateChanges.topic.listFields.length; i++) {
    let fieldName = constants.sessionBuilderValidateChanges.topic.listFields[i];
    if (oldSnapshot[id][fieldName] != currentSnapshot[id][fieldName] && stringHelpers.hash(sessionTopic[fieldName]) != currentSnapshot[id][fieldName]) {
      return false;
    }
  }
  return true;
}

function isTopicsDataValid(snapshot, sessionId, accountId, topics, sessionBuilderService) {
  return new bluebird(function (resolve, reject) {
    sessionBuilderService.sessionBuilderObjectStepSnapshot(sessionId, accountId, "facilitatiorAndTopics").then(function(snapshotResult) {
      let ids = Object.keys(snapshot);
      for (let i=0; i<ids.length; i++) {
        let id = ids[i];
        if (!isTopicDataValid(snapshotResult, snapshot, topics, id)) {
          resolve({ isValid: false, canChange: true, currentSnapshotChanges: getTopicsSnapshotWithoutProperties(snapshotResult) });
          return;
        }
      }
      resolve({ isValid: true });
    }, function(error) {
      reject(error);
    });
  });
}
