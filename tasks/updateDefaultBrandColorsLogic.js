'use strict';
const Bluebird = require('bluebird');
const models = require('../models');

module.exports = {
  update
};

function update() {
  return new Bluebird((resolve, reject) => {
    models.BrandProjectPreference.update({ default: true }, { where: { $or: [{ name: 'Default Focus Scheme' }, { name: 'Default Forum Scheme' }] } }).then(() => {
      resolve();
    }).catch((error) => {
      reject(error);
    });
  });
}
