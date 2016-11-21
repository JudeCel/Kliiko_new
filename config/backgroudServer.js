require('dotenv-extended').load({
    errorOnMissing: true
});

var config = {
  "development": {
    host:      process.env.REDIS_HOST,
    password:  null,
    port:      parseInt(process.env.REDIS_PORT),
    database:  parseInt(process.env.REDIS_DB),
    namespace: 'dashboard_jobs_dev',
    looping: true,
  },
  "test": {
    host:      process.env.REDIS_HOST_TEST,
    password:  null,
    port:      parseInt(process.env.REDIS_PORT_TEST),
    database:  parseInt(process.env.REDIS_DB_TEST),
    namespace: 'dashboard_jobs_test',
    looping: true,
  },
  "production": {
    host:      process.env.REDIS_HOST,
    password:  null,
    port:      parseInt(process.env.REDIS_PORT),
    database:  parseInt(process.env.REDIS_DB),
    namespace: 'dashboard_jobs_prod',
    looping: false,
  }
}
module.exports = config;
