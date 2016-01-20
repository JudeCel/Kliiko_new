"use strict";
var bcrypt = require('bcrypt');
var constants = require('../util/constants');

module.exports = (Sequelize, DataTypes) => {
  var User = Sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    firstName: {type: DataTypes.STRING, allowNull: false, validate: { notEmpty: {args: true, msg: "First Name can't be empty"} } },
    lastName: {type: DataTypes.STRING, allowNull: false, validate: { notEmpty: {args: true, msg: "Last Name can't be empty"} } },
    gender: {type: DataTypes.ENUM, allowNull: false, validate: { notEmpty: {args: true, msg: "Gender can't be empty"} }, values: ["male", "female"] },
    email: {type: DataTypes.STRING, allowNull: false, unique: {msg: "Email has already been taken"},
      validate: {
        notEmpty: {args: true, msg: "Email can't be empty"},
        is: {args: constants.emailRegExp, msg: "Invalid e-mail format" }
      }
    },

    encryptedPassword:  {type : DataTypes.STRING, allowNull: false, validate: { notEmpty: true}},
    password: {
      type: DataTypes.VIRTUAL,
      set: function(val) {
        this.setDataValue('password', val);
        if (val) {
          this.setDataValue('encryptedPassword', bcrypt.hashSync(val, 10))
        };
      },
      validate: {
        isLongEnough: function(value) {
          if(value.length < 7) {
          throw new Error("Make sure your password is longer than 7 characters");
          }
        }
      }
    },
    resetPasswordToken: {type : DataTypes.STRING, allowNull: true},
    resetPasswordSentAt: {type : DataTypes.DATE, allowNull: true},

    confirmationToken: {type : DataTypes.STRING, allowNull: true},
    confirmationSentAt: {type : DataTypes.DATE, allowNull: true},
    confirmedAt: {type : DataTypes.DATE, allowNull: true},
    currentSignInIp: {type : DataTypes.STRING, allowNull: true},
    promoCode: {type: DataTypes.INTEGER, allowNull: true},
    signInCount: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    tipsAndUpdate: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true},

    postalAddress: {type: DataTypes.STRING, allowNull: true },
    city: {type: DataTypes.STRING, allowNull: true },
    state: {type: DataTypes.STRING, allowNull: true },
    country: {type: DataTypes.STRING, allowNull: true },
    postcode: {type: DataTypes.STRING, allowNull: true },
    companyName: {type: DataTypes.STRING, allowNull: true },
    landlineNumber: {type: DataTypes.STRING, allowNull: true },
    mobile: {type: DataTypes.STRING, allowNull: true,
      validate: {
        is: {args: constants.mobileRegExp, msg: "Please re-enter in international format: Country Code & drop the first 0 e.g. +61-098-765 becomes 6198765"}
      }         
    }
  },{
      indexes: [{
        unique: true,
        fields: ['email']
      }],
      classMethods: {
        associate: function(models) {
          User.hasMany(models.SocialProfile, { foreignKey: 'userId'});
          User.hasMany(models.SessionMember, { foreignKey: 'userId'});
          User.belongsToMany(models.Vote, { through: models.VotesBy });
          User.belongsToMany(models.Account, { through: { model: models.AccountUser} });
          User.hasMany(models.AccountUser);
          User.hasMany(models.Event, { foreignKey: 'userId'});
          User.belongsToMany(models.Account, { through: { model: models.AccountUser, scope: { owner: true }},  as: 'OwnerAccount'});
          User.hasMany(models.Invite, { foreignKey: 'userId' });
          User.hasMany(models.Subscription);
        }
      }
    }
);
  return User;
};
