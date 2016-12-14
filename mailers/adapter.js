"use strict";
const { createTransport } = require('nodemailer');
var transport = null;

const sendMail = (content, cb) => {
  if (!transport) {
    transport = createTransport(config());
  }

  return transport.sendMail(content, cb)
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
