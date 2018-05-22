'use strict';

module.exports = {
  account: require('./account').plan,
  core:    require('./core').plan,
  junior:  require('./junior').plan,
  senior:  require('./senior').plan,
  trial:   require('./trial').plan,

  starter: require('./starter').plan,
  starter_annual: require('./starter').plan_annual,
  essentials: require('./essentials').plan,
  essentials_annual: require('./essentials').plan_annual,
  pro: require('./pro').plan,
  pro_annual: require('./pro').plan_annual,
};
