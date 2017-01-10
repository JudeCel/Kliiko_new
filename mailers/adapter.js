"use strict";
const { createTransport } = require('nodemailer');
let Bluebird = require('bluebird');
var transport = null;

const sendMail = (content) => {
  if (!transport) {
    transport = createTransport(config());
  }

  return new Bluebird((resolve, reject) => {
    transport.sendMail(content).then((data) => {
      resolve(data);
    }, (error) => {
      reject(error);
    });
  });
}

const testTransporter = {
    name: 'testsend',
    version: '1',
    send: function(data, callback) {
      // NOTE: MailGun response structure
      let resp = {
          accepted: [ data.data.to ],
          rejected: [],
          response: '250 Great success',
          envelope: {
           from: data.data.from,
           to: [ data.data.to ]
          },
          messageId: (data.messageId || '7fd443ff-d8a0-6fa0-ee5f-726935200fce@noreply.klzii.com'),
          html: data.data.html // NOTE: this not part of original response, only for tests.
        }

      callback(null, resp);
    }
};

const config = () =>  {
  switch (process.env.NODE_ENV) {
    case "test":
      return testTransporter;
      break;
    default:
      return {
        host: process.env.MAIL_TRANSPORT_SERVICE,
        auth: {
          user: process.env.MAIL_TRANSPORT_AUTH_USER,
          pass: process.env.MAIL_TRANSPORT_AUTH_PASS
        },
        debug: false,
        logger: false,
        secureConnection: process.env.MAIL_TRANSPORT_SECURE_CONNECTION == "true",
        port: parseInt(process.env.MAIL_TRANSPORT_PORT)
      };
  }
}

module.exports = {
  sendMail: sendMail
};
