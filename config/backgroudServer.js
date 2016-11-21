require('dotenv-extended').load({
    errorOnMissing: true
});

var config = {
  "development": {
    host:      process.env.REDIS_HOST,
    password:  null,
    port:      parseInt(process.env.REDIS_PORT),
    database:  parseInt(process.env.REDIS_DB),
    namespace: 'dashboard_jobs',
    looping: true,
  },
  "test": {
    host:      process.env.REDIS_HOST_TEST,
    password:  null,
    port:      parseInt(process.env.REDIS_PORT_TEST),
    database:  parseInt(process.env.REDIS_DB_TEST),
    namespace: 'dashboard_jobs',
    looping: true,
  },
  "production": {
    host:      process.env.REDIS_HOST,
    password:  null,
    port:      parseInt(process.env.REDIS_PORT),
    database:  parseInt(process.env.REDIS_DB),
    namespace: 'dashboard_jobs',
    looping: false,
  }
}
module.exports = config;
