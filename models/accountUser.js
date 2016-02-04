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
    status: { type: DataTypes.ENUM, allowNull: false, values: ['invited', 'active', 'inactive', 'added'], defaultValue: 'active' },
    state: {type: DataTypes.STRING, allowNull: true },
    postalAddress: {type: DataTypes.STRING, allowNull: true },
    city: {type: DataTypes.STRING, allowNull: true },
    country: {type: DataTypes.STRING, allowNull: true },
    postCode: {type: DataTypes.STRING, allowNull: true },
    companyName: {type: DataTypes.STRING, allowNull: true },
    landlineNumber: {type: DataTypes.STRING, allowNull: true,
      validate: {
        is: { args: constants.phoneRegExp, msg: ' Invalid phone number format' }
      }
    },
    mobile: {type: DataTypes.STRING, allowNull: true,
      validate: {
        is: { args: constants.phoneRegExp, msg: ' Invalid phone number format' }
      }
    },
    comment: { type: DataTypes.TEXT, allowNull: true },
    email: {type: DataTypes.STRING, allowNull: false,
      validate: {
        notEmpty: {args: true, msg: "Email can't be empty"},
        is: {args: constants.emailRegExp, msg: "Invalid e-mail format" }
      }
    },
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
