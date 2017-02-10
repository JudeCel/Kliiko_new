'use strict';

let models = require('./../models');
let { AccountUser, Session, SessionMember, Invite, Account } = models;
let Bluebird = require('bluebird');
let mailUrlHelper = require('../mailers/helpers');
var mailerHelpers = require('../mailers/mailHelper');

function sessionOverQuota( sessionId, inviteId) {
  return new Bluebird((resolve, reject) => {
    Invite.find({
      where: {
        id: inviteId
      },
      include: [AccountUser]
    }).then((invite) => {

      SessionMember.find({
        where: {
          sessionId: sessionId,
          role: 'facilitator'
        },
        include: [AccountUser, {model: Session, include: Account}]
      }).then((facilitator) => {

        let params = overQuotaParams(invite, facilitator);
        mailerHelpers.sendParticipantOverquota(params, (error, resp) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });

      }, (error) => {
        reject(error);
      });

    }, (error) => {
      reject(error);
    });
  });
}

function overQuotaParams(invite, facilitator) {
  return {
    firstName: facilitator.AccountUser.firstName,
    lastName: facilitator.AccountUser.lastName,
    accountName: facilitator.Session.Account.name,
    sessionName: facilitator.Session.name,
    guestFirstName: invite.AccountUser.firstName,
    guestLastName: invite.AccountUser.lastName,
    email: facilitator.AccountUser.email,
    role: invite.role,
    logInUrl: mailUrlHelper.getUrl('', null, '')
  };
}

module.exports = {
  sessionOverQuota: sessionOverQuota
};
