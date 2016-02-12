"use strict";
var bcrypt = require('bcrypt');
var constants = require('../util/constants');
var validations = require('./validations');

module.exports = (Sequelize, DataTypes) => {
  var User = Sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, allowNull: false, validate: {
      notEmpty: true,
      is: constants.emailRegExp,
      isUnique: validations.unique(Sequelize, 'User', 'email')
    } },
    encryptedPassword: { type : DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
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
    tipsAndUpdate: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true}
  },{
      indexes: [
        {
          name: "userUniqueEmail",
          unique: true,
          fields: ['email']
        },
        { fields: ['id'] },
        { fields: ['email'] }
      ],
      classMethods: {
        associate: function(models) {
          User.hasMany(models.SocialProfile, { foreignKey: 'userId'});
          User.hasMany(models.SessionMember, { foreignKey: 'userId'});
          User.belongsToMany(models.Vote, { through: models.VotesBy });
          User.belongsToMany(models.Account, { through: { model: models.AccountUser} });
          User.hasMany(models.AccountUser, { onDelete: 'CASCADE' });
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
