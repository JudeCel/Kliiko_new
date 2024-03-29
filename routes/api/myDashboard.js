'use strict';

var moment = require('moment-timezone');
var constants = require('../../util/constants');
var myDashboardServices = require('./../../services/myDashboard');
let policy = require('./../../middleware/policy.js');

module.exports = {
  getAllData: getAllData
};

function getAllData(req, res, next) {
  myDashboardServices.getAllData(req.currentResources.user.id, req.protocol).then(
    getResponses(req, res).onSuccess,
    getResponses(req, res).onError
  );
};

function getTheOnlySession(accounts) {
  let participants = accounts['participant'];
  let observers = accounts['observer'];
  if (participants && !observers && participants.data.length == 1) {
    return participants.data[0].dataValues.session;
  } else if (observers && !participants && observers.data.length == 1) {
    return observers.data[0].dataValues.session;
  } else {
    return null;
  }
}

function isManager(accounts) {
  return accounts["accountManager"] || accounts["facilitator"] ? true : false;
}

function getOwnAccountsCount(accounts) {
  let ownAccounts = 0;
  let accountManagers = accounts["accountManager"];
  if (accountManagers) {
    for(let i=0; i<accountManagers.data.length; i++) {
      if (accountManagers.data[i].owner) {
        ownAccounts++;
      }
    }
  }
  return ownAccounts;
}

function getResponses(req, res) {
  return {
    onError: function(error) {
      res.send({ error: error });
    },
    onSuccess: function(result) {
      let ownAccounts = getOwnAccountsCount(result);
      let theOnlySessionIsPending = false;
      let theOnlySessionIsClosed = false;
      let theOnlyPendingSessionTime = null;

      if (!isManager(result)) {
        let theOnlySession = getTheOnlySession(result);
        if (theOnlySession) {
          if (theOnlySession.showStatus == 'Pending') {
            theOnlySessionIsPending = true;
            theOnlyPendingSessionTime = moment(theOnlySession.startTime).tz(theOnlySession.timeZone).format();
          } else if (theOnlySession.showStatus == 'Closed') {
            theOnlySessionIsClosed = true;
          }
        }
      }
      let role = req.currentResources.accountUser.role;
      res.send({
        data: result,
        dateFormat: constants.dateFormat,
        hasOwnAccount: ownAccounts > 0,
        hasRoles: Object.keys(result).length > 0,
        //canCreateNewAccount: false, //ownAccounts < constants.maxAccountsAmount,
        canCreateNewAccount: policy.hasAccess(req.currentResources.accountUser.role, ['admin']),
        theOnlySessionIsPending: theOnlySessionIsPending,
        theOnlySessionIsClosed: theOnlySessionIsClosed,
        theOnlyPendingSessionTime: theOnlyPendingSessionTime
      });
    }
  };
};
