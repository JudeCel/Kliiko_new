'use strict';

var sessionServices = require('./../session');
var subscriptionServices = require('./../subscription');

var q = require('q');
var async = require('async');

var MESSAGES = {
  closed: 'Session has been closed',
  topics: 'There are no topics added',
  errors: {
    Expired: 'This session has expired',
    Pending: 'This session has not started yet'
  },
}

module.exports = {
  validate: validate,
  validateState: validateState,
  validateTopics: validateTopics,
  validateDates: validateDates,
  addShowStatus: addShowStatus,
  messages: MESSAGES
};

function validate(sessionMember, provider) {
  let deferred = q.defer();
  let list = [function(cb) { validateTopics(sessionMember.Session, cb); }];

  if(sessionMember.AccountUser.role != 'accountManager') {
    switch(sessionMember.role) {
      case 'participant':
        list.push(function(cb) { validateState(sessionMember.Session, cb); });
        list.push(function(cb) { validateDates(sessionMember.Session, provider, cb); });
        break;
    }
  }

  async.waterfall(list, function(error) {
    if(error) {
      deferred.reject(error);
    }
    else {
      deferred.resolve(null);
    }
  });

  return deferred.promise;
}

function validateState(session, cb) {
  cb(session.active ? null : MESSAGES.closed);
}

function validateTopics(session, cb) {
  if(session.SessionTopics && session.SessionTopics.length > 0) {
    cb(null);
  }
  else {
    cb(MESSAGES.topics);
  }
}

function validateDates(session, provider, cb) {
  subscriptionServices.getChargebeeSubscription(session.Account.Subscription.subscriptionId, provider).then(function(chargebeeSub) {
    addShowStatus(session, chargebeeSub);
    let error = MESSAGES.errors[session.dataValues.showStatus];

    if(error) {
      cb(error);
    }
    else {
      cb(null);
    }
  }, function(error) {
    cb(error);
  });
}

function addShowStatus(session, chargebeeSub) {
  let endDate = new Date((chargebeeSub.current_term_end || chargebeeSub.trial_end) * 1000);
  let settings = session.dataValues || session;
  settings.expireDate = endDate;

  if(session.active) {
    var date = new Date();
    if(chargebeeSub && (date > endDate || date > new Date(session.endTime))) {
      settings.showStatus = 'Expired';
    }
    else if(date < new Date(session.startTime)) {
      settings.showStatus = 'Pending';
    }
    else {
      settings.showStatus = 'Open';
    }
  }
  else {
    settings.showStatus = 'Closed';
  }
}
