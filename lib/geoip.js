'use strict';

const request = require('request');
const Bluebird = require('bluebird');
const messages = require('./../util/messages');

module.exports = { get };

function get(params = {}) {
  return new Bluebird((resolve, reject) => {
    if(!params.ip) return reject(messages.geoip.noIp);

    request.get(options(params), (error, res, data) => {
      error ? reject(error) : resolve(data);
    });
  });
}

function options(params) {
  return {
    url: `http://freegeoip.net/json/${params.ip}`,
    json: true
  };
}
