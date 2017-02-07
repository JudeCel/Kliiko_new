'use strict';

let models = require('./../models');
let filters = require('./../models/filters');
let { enqueue } = require('./backgroundQueue');
let { AccountUser, Session } = models;
let AccountUserService = require('./accountUser');
let sessionMemberService = require('./sessionMember');
let socialProfileService = require('./socialProfile');
let inviteMailer = require('../mailers/invite');
let mailerHelpers = require('../mailers/mailHelper');
let constants = require('../util/constants');
let backgroundQueues = require('../util/backgroundQueue');
let MessagesUtil = require('./../util/messages');
let accountUserService = require('./accountUser');
let uuid = require('node-uuid');
let async = require('async');
let _ = require('lodash');
let q = require('q');
let Bluebird = require('bluebird');
let mailUrlHelper = require('../mailers/helpers');


function sendNotification(accountUserId, sessionId) {


  AccountUser.find({
    where: { id: accountUserId }
  }).then(function(accountUser) {
    if (!invite) { return deferred.reject(MessagesUtil.invite.notFound) }

    resolve(result);
  }, function(error) {
    reject(filters.errors(error));
  });

//todo:
}


module.exports = {
  sendNotification: sendNotification
};
