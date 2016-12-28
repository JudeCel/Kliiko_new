'use strict';

var constants = require('./../util/constants');
var messages = require('./../util/messages');
var _ = require('lodash');
var stringHelpers = require('./../util/stringHelpers');
var bluebird = require('bluebird');
var models = require('./../models');

// Exports
module.exports = {
  isDataValid: isDataValid,
  isFacilitatorDataValid: isFacilitatorDataValid, 
  isTopicsDataValid: isTopicsDataValid,
  isTopicDataValid: isTopicDataValid,
  isMailTemplateDataValid: isMailTemplateDataValid,
  getMailTemplateSnapshot: getMailTemplateSnapshot,
  getTopicSnapshot: getTopicSnapshot,
  getSessionSnapshot: getSessionSnapshot
};

//if isValid == true than all other params are not required
function result(isValid, canChange, currentSnapshotChanges, fieldName, currentValueSnapshot) {
  if (isValid) {
    return { isValid: true };
  } else {
    return { 
      isValid: false, 
      canChange: canChange, 
      fieldName: fieldName, 
      currentValueSnapshot: currentValueSnapshot, 
      currentSnapshotChanges: currentSnapshotChanges, 
      message: canChange ? messages.sessionBuilderValidateChanges.canChange : messages.sessionBuilderValidateChanges.canNotChange
    };
  }
}

function isDataValid(snapshot, params, session) {
  for (let i=0; i<constants.sessionBuilderValidateChanges.session.notChangableFields.length; i++) {
    let fieldName = constants.sessionBuilderValidateChanges.session.notChangableFields[i];
    if (params[fieldName]) {
      if (params[fieldName] == session[fieldName]) {
        return result(true);
      } else {
        let oldValueSnapshot = snapshot[fieldName];
        let currentValueSnapshot = stringHelpers.hash(session[fieldName]);
        return result(currentValueSnapshot == oldValueSnapshot, false, null, fieldName, currentValueSnapshot);
      }
    }
  }

  for (let i=0; i<constants.sessionBuilderValidateChanges.session.changableFields.length; i++) {
    let fieldName = constants.sessionBuilderValidateChanges.session.changableFields[i];
    if (params[fieldName]) {
      if (params[fieldName] == session[fieldName]) {
        return result(true);
      } else {
        let oldValueSnapshot = snapshot[fieldName];
        let currentValueSnapshot = stringHelpers.hash(session[fieldName]);
        return result(currentValueSnapshot == oldValueSnapshot, true, null, fieldName, currentValueSnapshot);
      }
    }
  }

  return result(true);
}

function isFacilitatorDataValid(snapshot, facilitatorId, sessionId, sessionBuilderService) {
  return new bluebird(function (resolve, reject) {
    sessionBuilderService.searchSessionMembers(sessionId, 'facilitator').then(function(members) {
      if(!_.isEmpty(members)) {
        let facilitator = members[0];
        if (facilitatorId == facilitator.id) {
          return result(true);
        } else {
          let currentValueSnapshot = stringHelpers.hash(facilitator.id);
          resolve(result(currentValueSnapshot == snapshot.facilitatorId, true, null, "facilitatorId", currentValueSnapshot));
        }
      } else {
        resolve(result(true));
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

function getMailTemplateSnapshot(mailTemplate) {
  let res = { };
  for (let i=0; i<constants.sessionBuilderValidateChanges.mailTemplate.fields.length; i++) {
    let fieldName = constants.sessionBuilderValidateChanges.mailTemplate.fields[i];
    res[fieldName] = stringHelpers.hash(mailTemplate[fieldName]);
  }
  return res;
}

function getTopicSnapshot(sessionTopic) {
  let topicRes = { };
  let fields = constants.sessionBuilderValidateChanges.topic.propertyFields.concat(constants.sessionBuilderValidateChanges.topic.listFields);
  for (let i=0; i<fields.length; i++) {
    let fieldName = fields[i];
    topicRes[fieldName] = stringHelpers.hash(sessionTopic[fieldName]);
  }
  return topicRes;
}

function getSessionSnapshot(session) {
  let res = { };
  let fields = constants.sessionBuilderValidateChanges.session.changableFields.concat(constants.sessionBuilderValidateChanges.session.notChangableFields);
  for (let i=0; i<fields.length; i++) {
    let fieldName = fields[i];
    res[fieldName] = stringHelpers.hash(session[fieldName]);
  }
  return res;
}

function isMailTemplateDataValid(snapshot, params, mailTemplate) {
  let currentSnapshot = getMailTemplateSnapshot(mailTemplate);
  for (let i=0; i<constants.sessionBuilderValidateChanges.mailTemplate.fields.length; i++) {
    let fieldName = constants.sessionBuilderValidateChanges.mailTemplate.fields[i];
    if (params.template[fieldName] && params.template[fieldName] != mailTemplate[fieldName] && snapshot[fieldName] != currentSnapshot[fieldName]) {
      return result(false, true, currentSnapshot, null, null);
    }
  }
  return result(true);
}

function isTopicDataValid(snapshot, params, sessionTopic) {
  let currentSnapshot = getTopicSnapshot(sessionTopic);
  let oldSnapshot = snapshot[sessionTopic.topicId];
  for (let i=0; i<constants.sessionBuilderValidateChanges.topic.propertyFields.length; i++) {
    let fieldName = constants.sessionBuilderValidateChanges.topic.propertyFields[i];
    if (params[fieldName] && params[fieldName] != sessionTopic[fieldName] && oldSnapshot[fieldName] != currentSnapshot[fieldName]) {
      let currentSnapshotChanges = { };
      currentSnapshotChanges[sessionTopic.topicId] = currentSnapshot;
      return result(false, true, currentSnapshotChanges, null, null);
    }
  }
  return result(true);
}

function isTopicListDataValid(currentSnapshot, oldSnapshot, topics, id) {
  if (!(id in currentSnapshot)) {
    return false;
  }
  let sessionTopic = getSessionTopic(topics, id);
  for (let i=0; i<constants.sessionBuilderValidateChanges.topic.listFields.length; i++) {
    let fieldName = constants.sessionBuilderValidateChanges.topic.listFields[i];
    let newValueSnapshot = stringHelpers.hash(sessionTopic[fieldName]);
    let currentSnapshotValue = currentSnapshot[id][fieldName];
    if (oldSnapshot[id][fieldName] != currentSnapshotValue && newValueSnapshot != currentSnapshotValue) {
      return false;
    }
  }
  return true;
}

function isTopicsDataValid(snapshot, sessionId, accountId, topics) {
  return new bluebird(function (resolve, reject) {
    models.SessionTopics.findAll({ where: { sessionId: sessionId } }).then(function(currentTopics) {
      let currentSnapshot = { };
      for (let i=0; i<currentTopics.length; i++) {
        let topic = currentTopics[i];
        currentSnapshot[topic.topicId] = getTopicSnapshot(topic);
      }
      let ids = Object.keys(snapshot);
      for (let i=0; i<ids.length; i++) {
        let id = ids[i];
        if (!isTopicListDataValid(currentSnapshot, snapshot, topics, id)) {
          resolve(result(false, true, getTopicsSnapshotWithoutProperties(currentSnapshot), null, null));
          return;
        }
      }
      resolve(result(true));
    });
  });
}
