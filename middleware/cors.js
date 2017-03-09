'use strict';
let cors = require('cors');

const setCors = () => {
  let corsOrigin = new RegExp(process.env.SERVER_CHAT_DOMAIN_URL + "(:\\d+)*");

  return cors({ origin: corsOrigin });
}

module.exports = {
  setCors: setCors
}
