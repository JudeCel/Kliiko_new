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
  for (let i=0; i<constants.sessionBuilderValudateChanges.session.notChangableFields.length; i++) {
    let fieldName = constants.sessionBuilderValudateChanges.session.notChangableFields[i];
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

  for (let i=0; i<constants.sessionBuilderValudateChanges.session.changableFields.length; i++) {
    let fieldName = constants.sessionBuilderValudateChanges.session.changableFields[i];
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

function getTopicsSnapshotWithOrdersOnly(snapshot) {
  let ids = Object.keys(snapshot);
  for (let i=0; i<ids.length; i++) {
    let id = ids[i];
    let values = Object.keys(snapshot[id]);
    for (let i2=0; i2<values.length; i2++) {
      let value = values[i2];
      if (value != "order") {
        delete snapshot[id][value];
      }
    }
  }
  return snapshot;
}

function getTopic(topics, id) {
  for (let i=0; i<topics.length; i++) {
    if (topics[i].id == id) {
      return topics[i];
    }
  }
  return { };
}

function isTopicsDataValid(snapshot, sessionId, accountId, topics, sessionBuilderService) {
  return new bluebird(function (resolve, reject) {
    sessionBuilderService.sessionBuilderObjectStepSnapshot(sessionId, accountId, "facilitatiorAndTopics").then(function(snapshotResult) {
      let ids = Object.keys(snapshot);
      for (let i=0; i<ids.length; i++) {
        let id = ids[i];
        if (!(id in snapshotResult) || snapshot[id].order != snapshotResult[id].order && stringHelpers.hash(getTopic(topics, id).sessionTopic.order) != snapshotResult[id].order) {
          resolve({ isValid: false, canChange: true, currentSnapshotChanges: getTopicsSnapshotWithOrdersOnly(snapshotResult) });
          return;
        }
      }
      resolve({ isValid: true });
    }, function(error) {
      reject(error);
    });
  });
}
