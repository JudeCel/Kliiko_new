require('dotenv-extended').load({
  errorOnMissing: true
});

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.TEST_ENV = process.env.TEST_ENV || 'test';

process.env.REDIS_DB = process.env.REDIS_DB_TEST
process.env.REDIS_HOST = process.env.REDIS_HOST_TEST
process.env.REDIS_PORT = process.env.REDIS_PORT_TEST

process.env.TWILIO_ACCOUNT_SID="ACf88baabe9d669c23950914a5be8f8a1e"
process.env.TWILIO_AUTH_TOKEN="c23ece04ae316b8f10aec5849db9b8f9"
process.env.TWILIO_SENDER_NUMBER="+15005550006"

process.env.SERVER_PORT = 5678
