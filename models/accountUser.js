"use strict";

var constants = require('../util/constants');

module.exports = (Sequelize, DataTypes) => {
  var AccountUser = Sequelize.define('AccountUser', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    firstName: {type: DataTypes.STRING, allowNull: false, validate: { notEmpty: {args: true, msg: "First Name can't be empty"} } },
    lastName: {type: DataTypes.STRING, allowNull: false, validate: { notEmpty: {args: true, msg: "Last Name can't be empty"} } },
    gender: {type: DataTypes.ENUM, allowNull: false, validate: { notEmpty: {args: true, msg: "Gender can't be empty"} }, values: ["male", "female"] },
    owner: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    role: { type: DataTypes.ENUM, allowNull: false, values: constants.systemRoles },
    postalAddress: {type: DataTypes.STRING, allowNull: true },
    city: {type: DataTypes.STRING, allowNull: true },
    state: {type: DataTypes.STRING, allowNull: true },
    country: {type: DataTypes.STRING, allowNull: true },
    postcode: {type: DataTypes.STRING, allowNull: true },
    companyName: {type: DataTypes.STRING, allowNull: true },
    landlineNumber: {type: DataTypes.STRING, allowNull: true },
    mobile: {type: DataTypes.STRING, allowNull: true },
    comment: { type: DataTypes.TEXT, allowNull: true },
    email: {type: DataTypes.STRING, allowNull: false, unique: {msg: "Email has already been taken"},
      validate: {
        notEmpty: {args: true, msg: "Email can't be empty"},
        is: {args: constants.emailRegExp, msg: "Invalid e-mail format" }
      }
    },
  }, {
      classMethods: {
        associate: function(models) {
          AccountUser.belongsTo(models.User);
          AccountUser.belongsTo(models.Account);
        }
      }
    }
);

  return AccountUser;
};
