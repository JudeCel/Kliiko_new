'use strict';

var constants = require('./../util/constants');
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
  let res = { };
  res[sessionTopic.topicId] = topicRes;
  return res;
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
  let currentSnapshot = getTopicSnapshot(sessionTopic)
  for (let i=0; i<constants.sessionBuilderValidateChanges.mailTemplate.fields.length; i++) {
    let fieldName = constants.sessionBuilderValidateChanges.mailTemplate.fields[i];
    if (params[fieldName] && params[fieldName] != mailTemplate[fieldName] && snapshot[fieldName] != currentSnapshot[fieldName]) {
      return { isValid: false, canChange: true, currentSnapshotChanges: currentSnapshot };
    }
  }
  return { isValid: true };
}

function isTopicDataValid(snapshot, params, sessionTopic) {
  let currentSnapshotObj = getTopicSnapshot(sessionTopic) = getTopicSnapshot(sessionTopic);
  let currentSnapshot = currentSnapshotObj[sessionTopic.topicId];
  let oldSnapshot = snapshot[sessionTopic.topicId];
  for (let i=0; i<constants.sessionBuilderValidateChanges.topic.propertyFields.length; i++) {
    let fieldName = constants.sessionBuilderValidateChanges.topic.propertyFields[i];
    if (params[fieldName] && params[fieldName] != sessionTopic[fieldName] && oldSnapshot[fieldName] != currentSnapshot[fieldName]) {
      return { isValid: false, canChange: true, currentSnapshotChanges: currentSnapshotObj };
    }
  }
  return { isValid: true };
}

function isTopicListDataValid(currentSnapshot, oldSnapshot, topics, id) {
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

function isTopicsDataValid(snapshot, sessionId, accountId, topics) {
  return new bluebird(function (resolve, reject) {
    models.SessionTopics.findAll({ where: { sessionId: sessionId } }).then(function(currentTopics) {
      let currentSnapshot = { };
      for (let i=0; i<currentTopics.length; i++) {
        let topic = currentTopics[i];
        currentSnapshot[topic.topicId] = getTopicSnapshot(topic)[topic.topicId];
      }
      let ids = Object.keys(snapshot);
      for (let i=0; i<ids.length; i++) {
        let id = ids[i];
        if (!isTopicListDataValid(currentSnapshot, snapshot, topics, id)) {
          resolve({ isValid: false, canChange: true, currentSnapshotChanges: getTopicsSnapshotWithoutProperties(currentSnapshot) });
          return;
        }
      }
      resolve({ isValid: true });
    });
  });
}
