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
    send: function(data, callback) { callback(null, data) }
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
