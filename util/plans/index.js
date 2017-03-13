'use strict';

module.exports = {
  account: require('./account').plan,
  core:    require('./core').plan,
  junior:  require('./junior').plan,
  senior:  require('./senior').plan,
  trial:   require('./trial').plan,
}