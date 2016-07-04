"use strict";

var constants = require('../util/constants');
var validations = require('./validations');

module.exports = (Sequelize, DataTypes) => {
  var AccountUser = Sequelize.define('AccountUser', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    firstName: {type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true, isLength: validations.length('firstName', { max: 35 }) } },
    lastName: {type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true, isLength: validations.length('lastName', { max: 35 }) } },
    gender: {type: DataTypes.ENUM, allowNull: true, validate: { notEmpty: true }, values: constants.gender },
    owner: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    reveiveNewsLetters: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    role: { type: DataTypes.ENUM, allowNull: false, values: constants.systemRoles },
    status: { type: DataTypes.ENUM, allowNull: false, values: ['invited', 'active', 'inactive', 'added'], defaultValue: 'active' },
    state: {type: DataTypes.STRING, allowNull: true },
    postalAddress: {type: DataTypes.STRING, allowNull: true, validate: { isLength: validations.length('postalAddress', { max: 100 }) } },
    city: {type: DataTypes.STRING, allowNull: true, validate: { isLength: validations.length('city', { max: 45 }) } },
    country: {type: DataTypes.STRING, allowNull: true, validate: { isLength: validations.length('country', { max: 70 }) } },
    postCode: {type: DataTypes.STRING, allowNull: true, validate: { isLength: validations.length('postCode', { min: 2, max: 11 }) } },
    companyName: {type: DataTypes.STRING, allowNull: true, validate: { isLength: validations.length('companyName', { max: 50 }) } },
    phoneCountryData:	{ type: DataTypes.JSON, allowNull: false, defaultValue: {name: "Australia", iso2: "au", dialCode: "61"} },
    landlineNumberCountryData:	{ type: DataTypes.JSON, allowNull: false, defaultValue: {name: "Australia", iso2: "au", dialCode: "61"} },
    landlineNumber: {type: DataTypes.STRING, allowNull: true,
      validate: {
        validateNumber: function() {
          if(this.landlineNumber && !constants.phoneRegExp.test(this.landlineNumber)) {
            throw new Error(`Invalid phone number format (ex. ${constants.validPhoneFormat})`);
          }
        }
      }
    },
    mobile: {type: DataTypes.STRING, allowNull: true,
      validate: {
        validateNumber: function() {
          if(this.mobile && !constants.phoneRegExp.test(this.mobile)) {
            throw new Error(`Invalid phone number format (ex. ${constants.validPhoneFormat})`);
          }
        }
      }
    },
    comment: { type: DataTypes.TEXT, allowNull: true },
    email: {type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true, is: constants.emailRegExp, isLength: validations.length('email', { max: 60 }) } },
  }, {
      indexes: [{
        name: "compositeUserIdAndAccountIdAndEmail",
        unique: {msg: "Email has already been taken"},
        fields: ['email', 'UserId', 'AccountId']
      },
        { fields: ['email'] },
        { fields: ['id'] }
      ],
      classMethods: {
        associate: function(models) {
          AccountUser.belongsTo(models.User);
          AccountUser.belongsTo(models.Account);
          AccountUser.hasMany(models.Invite, { foreignKey: 'accountUserId' });
          AccountUser.hasMany(models.ContactListUser, { foreignKey: 'accountUserId' });
          AccountUser.hasMany(models.SessionMember, { foreignKey: 'accountUserId' });
        }
      }
    }
);

  return AccountUser;
};
