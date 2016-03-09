var config = require('config');
var airbrake = require('airbrake').createClient(config.get('airbrakeProjectId'), config.get('airbrakeApiKey'));
airbrake.developmentEnvironments = ['test'];

module.exports = {
  instance: airbrake,
  handleExceptions: airbrake.handleExceptions
};
