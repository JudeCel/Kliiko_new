require('dotenv-extended').load({
    errorOnMissing: true
});

var config = {
  host:      process.env.REDIS_HOST,
  password:  null,
  port:      parseInt(process.env.REDIS_PORT),
  database:  parseInt(process.env.REDIS_DB),
  namespace: 'resque',
  looping: true
}
module.exports = config;
