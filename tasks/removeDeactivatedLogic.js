'use strict';
const Bluebird = require('bluebird');
const models = require('../models');
const AccountUserService = require('./../services/accountUser');

module.exports = {
  process
};

function process() {
  return new Bluebird((resolve, reject) => {
    models.AccountUser.findAll({
      attributes: ['id', 'AccountId', 'UserId'],
      where: {
        active: false
      }
    }).then((aus) => {

      console.log("Items will be removed: " + aus.length);

      return Bluebird.each(aus, (au) => {
        return AccountUserService.removeDeactivated(au.dataValues.id);
      });

    }).then(() => {
      resolve();
    }).catch((error) => {
      reject(error);
    });
  });
}
