'use strict';

let models = require('./../models');
let filters = require('./../models/filters');
let { AccountUser, Session, SessionMember } = models;
let constants = require('../util/constants');
let MessagesUtil = require('./../util/messages');
let Bluebird = require('bluebird');
let mailUrlHelper = require('../mailers/helpers');
var notificationMailer = require('../mailers/notification');


function sendNotification(accountUserId, sessionId) {
  return new Bluebird((resolve, reject) => {

    AccountUser.find({
      where: { id: accountUserId },
      attributes: constants.safeAccountUserParams,
      include: { model: models.ContactListUser }
    }).then(function(accountUser) {
      if (!accountUser) { return reject(MessagesUtil.accountUser.notFound) }

      SessionMember.find({
        where: {
          sessionId: sessionId,
          role: 'facilitator'
        },
        include: [AccountUser, Session]
      }).then(function(sessionMember) {
        if (!sessionMember) { return reject(MessagesUtil.sessionMember.notFound) }

        send(accountUser, sessionMember.Session, sessionMember.AccountUser).then(function(accountUser) {
          resolve();
        }, function(error) {
          reject(filters.errors(error));
        });

      }, function(error) {
        reject(filters.errors(error));
      });

    }, function(error) {
      reject(filters.errors(error));
    });

  });
}

function send(accountUser, session, facilitator) {
  return new Bluebird((resolve, reject) => {

    let params = {
      unsubscribeMailUrl: mailUrlHelper.getUrl(accountUser.ContactListUsers[0].unsubscribeToken, null, '/unsubscribe/'),
      firstName: accountUser.firstName,
      sessionName: session.name,
      facilitatorFirstName: facilitator.firstName,
      facilitatorLastName: facilitator.lastName,
      facilitatorMail: facilitator.email,
      email: accountUser.email
    }

    notificationMailer.sendNotification(params, function (error, data) {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
}

module.exports = {
  sendNotification: sendNotification
};
