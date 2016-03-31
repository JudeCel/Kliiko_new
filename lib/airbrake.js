var config = require('config');
var airbrake = require('airbrake').createClient(process.env.AIRBRAKE_PROJECT_ID, process.env.AIRBRAKE_API_KEY);

airbrake.developmentEnvironments = ['test'];

module.exports = {
  instance: airbrake,
  handleExceptions: airbrake.handleExceptions
};
