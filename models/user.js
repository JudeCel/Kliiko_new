'use strict';

var bcrypt = require('bcrypt');
var constants = require('./../util/constants');
var validations = require('./validations');
var MessagesUtil = require('./../util/messages');

module.exports = (Sequelize, DataTypes) => {
  var User = Sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, allowNull: false, validate: {
      notEmpty: true,
      is: constants.emailRegExp,
      isUnique: validations.unique(Sequelize, 'User', 'email'),
      isLength: validations.length('email', { max: 60 })
    } },
    encryptedPassword: { type : DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
    password: { type: DataTypes.VIRTUAL, set: setPassword, validate: { isLongEnough: validateLength } },
    resetPasswordToken: { type : DataTypes.STRING, allowNull: true },
    resetPasswordSentAt: { type : DataTypes.DATE, allowNull: true },
    confirmationToken: { type : DataTypes.STRING, allowNull: true },
    confirmationSentAt: { type : DataTypes.DATE, allowNull: true },
    confirmedAt: { type : DataTypes.DATE, allowNull: true },
    currentSignInIp: { type : DataTypes.STRING, allowNull: true },
    signInCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    tipsAndUpdate: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
  }, {
    indexes: [{
        name: 'userUniqueEmail',
        unique: true,
        fields: ['email']
      },
      { fields: ['id'] },
      { fields: ['email'] }
    ],
    classMethods: {
      associate: function(models) {
        User.hasMany(models.Invite, { foreignKey: 'userId' });
        User.hasMany(models.AccountUser, { onDelete: 'CASCADE' });
        User.hasMany(models.SocialProfile, { foreignKey: 'userId' });
        User.belongsToMany(models.Account, { through: { model: models.AccountUser} });
        User.belongsToMany(models.Account, { through: { model: models.AccountUser},  as: 'OwnerAccount' });
      }
    }
  });

  return User;
};

function setPassword(val) {
  this.setDataValue('password', val);
  if (val) {
    this.setDataValue('encryptedPassword', bcrypt.hashSync(val, 10));
  }
}

function validateLength(value) {
  if(value.length < 7) {
    throw new Error(MessagesUtil.models.user.password);
  }
}
