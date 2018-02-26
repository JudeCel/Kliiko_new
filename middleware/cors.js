'use strict';
const cors = require('cors');
const _ = require('lodash');

const setCors = () => {
  const whitelist = [process.env.SERVER_BASE_DOMAIN, process.env.SERVER_CHAT_DOMAIN_URL, process.env.KLZII_HOMEPAGE_URL];
  const corsOptions = {
    origin: (origin, callback) => {
      if(origin){
        if(_.some(whitelist, (url) => origin.indexOf(url) > -1 )){
          callback(null, true);
        }else{
          callback(new Error('Not allowed by CORS'));
        }
      }else{
        callback(null, true);
      }
    }
  }

  return cors(corsOptions);
}

module.exports = {
  setCors: setCors
}
