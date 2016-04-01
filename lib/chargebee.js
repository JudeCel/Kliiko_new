var chargebee = require('chargebee');

chargebee.configure({
  site: process.env.CHARGEBEE_SITE,
  api_key: process.env.CHARGEBEE_API_KEY
});

module.exports = {
  instance: chargebee
};
