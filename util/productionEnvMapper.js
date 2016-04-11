'use strict';

function map() {
  if (process.env.NODE_ENV === 'production') {
    process.env.REDIS_HOST = process.env.REDIS_MASTER_SERVICE_HOST;
    process.env.REDIS_PORT = process.env.REDIS_MASTER_SERVICE_PORT;
  }
}

module.exports = {
    map: map
}
