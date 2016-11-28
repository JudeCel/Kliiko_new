'use strict';
var {User, AccountUser } = require('./../../models');
let Bluebird = require('bluebird');
var _ = require('lodash');

function updateAccountUsersUserId() {
  return new Bluebird(function (resolve, reject) {
    User.findAll({attributes: ['id', 'email']}).then((result) => {
      Bluebird.each(result, (item) => {
        return new Bluebird(function (resolve, reject) {
          AccountUser.update({"UserId": item.id}, {where: {"UserId": null, email: { ilike: item.email } }}).then(() =>{
            resolve();
          });
        });
      }).then(function(result) {
        resolve();
      },function(error) {
        reject(error);
      })
    });
  })
}

module.exports = {
  updateAccountUsersUserId: updateAccountUsersUserId,
}
