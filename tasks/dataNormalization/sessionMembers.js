'use strict';
var {sequelize, SessionMember } = require('./../../models');
let Bluebird = require('bluebird');
var _ = require('lodash');

function updateTypeOfCreation() {
  return new Bluebird(function (resolve, reject) {
    sequelize.query(`SELECT sm.id FROM "SessionMembers" as sm
      RIGHT JOIN "Invites" as i on(
        i."role"::varchar = sm."role"::varchar and
        i."accountUserId" = sm."accountUserId" and
      	i."sessionId" = sm."sessionId"
      )`,
      { type: sequelize.QueryTypes.SELECT}
    ).then((result) =>  {
        console.log(result, "result");
        let ids = _.map(result, (i) => {return i.id})
        SessionMember.update({typeOfCreation: 'system'}, {where: {id: {$notIn: ids }}}).then((updateResult) => {
          console.log(updateResult);
          resolve();
        }, (error) => {
          reject(error);
        })
    })
  })
}

module.exports = {
  updateTypeOfCreation: updateTypeOfCreation,
}
