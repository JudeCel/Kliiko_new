require('dotenv-extended').load({
    errorOnMissing: true,
    overrideProcessEnv: false
});

var config = {
  "development": {
    "username": process.env.DATABASE_USER_DEV,
    "password": process.env.DATABASE_PASSWORD_DEV,
    "database": process.env.DATABASE_NAME_DEV,
    "host": process.env.DATABASE_HOST_DEV,
    "dialect": process.env.DATABASE_DIALECT_DEV,
    logging: false
  },
  "test": {
    "username": process.env.DATABASE_USER_TEST,
    "password": process.env.DATABASE_PASSWORD_TEST,
    "database": process.env.DATABASE_NAME_TEST,
    "host": process.env.DATABASE_HOST_TEST,
    "dialect": process.env.DATABASE_DIALECT_TEST,
    logging: false
  },
  "production": {
    "username": process.env.DATABASE_USER_PROD,
    "password": process.env.DATABASE_PASSWORD_PROD,
    "database": process.env.DATABASE_NAME_PROD,
    "host": process.env.DATABASE_HOST_PROD,
    "dialect": process.env.DATABASE_DIALECT_PROD,
    logging: false
  }
}

console.log(config);
module.exports = config;
