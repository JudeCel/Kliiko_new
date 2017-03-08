'use strict';

function getBaseUrl() {
  return 'http://' + process.env.SERVER_DOMAIN + getPort();
};

function getPort() {
  let port = '';
  if (process.env.SERVER_PORT && process.env.NODE_ENV != 'production') {
    port = ':' + process.env.SERVER_PORT;
  }
  return port;
}

module.exports = {
  getBaseUrl: getBaseUrl,
  getPort: getPort
}
