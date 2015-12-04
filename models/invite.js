'use strict';
var bcrypt = require('bcrypt');

module.exports = (Sequelize, DataTypes) => {
  var Invite = Sequelize.define('Invite', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    token: { type : DataTypes.STRING, allowNull: false, validate: { notEmpty: { args: true, msg: "can't be empty" } } },
    sentAt: { type : DataTypes.DATE, allowNull: false, validate: { notEmpty: { args: true, msg: "can't be empty" } } },
    expireAt: { type : DataTypes.DATE, allowNull: false, validate: { notEmpty: { args: true, msg: "can't be empty" } } },
    role: { type: DataTypes.ENUM, allowNull: false, values: ['admin', 'accountManager', 'facilitator', 'observer', 'participant'] },
    // status: { type: DataTypes.ENUM, values: ['off', 'on'], allowNull: false, validate: { notEmpty: { args: true, msg: "can't be empty" } } },
  }, {
    classMethods: {
      associate: function(models) {
        Invite.belongsTo(models.AccountUser, { foreignKey: 'accountUserId' });
      }
    }
  });

  return Invite;
};
