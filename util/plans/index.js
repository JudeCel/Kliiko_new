'use strict';
const account  = require('./account').plan;
const core     = require('./core').plan;
const junior   = require('./junior').plan;
const senior   = require('./senior').plan;
const trial    = require('./trial').plan;

module.exports = {
  account,
  core,
  junior,
  senior,
  trial
}
