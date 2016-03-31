require('dotenv-extended').load({
  errorOnMissing: true
});

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.TEST_ENV = process.env.TEST_ENV || 'test';

process.env.DATABASE_URL = process.env.DATABASE_URL_TEST

process.env.REDIS_DB = process.env.REDIS_DB_TEST
process.env.REDIS_HOST = process.env.REDIS_HOST_TEST
process.env.REDIS_PORT = process.env.REDIS_PORT_TEST

process.env.SERVER_PORT = 5678
