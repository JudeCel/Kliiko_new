"use strict";
var bcrypt = require('bcrypt');
var constants = require('../util/constants')

module.exports = (Sequelize, DataTypes) => {
  var User = Sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    firstName: {type: DataTypes.STRING, allowNull: false, validate: { notEmpty: {args: true, msg: "can't be empty"} } },
    lastName: {type: DataTypes.STRING, allowNull: false, validate: { notEmpty: {args: true, msg: "can't be empty"} } },
    requiredEmail: { type: DataTypes.VIRTUAL, defaultValue: true },
    gender: {type: DataTypes.ENUM, allowNull: false, validate: { notEmpty: {args: true, msg: "can't be empty"} }, values: ["male", "female"] },
    mobileNumber: {type: DataTypes.STRING, allowNull: true },
    landlineNumber: {type: DataTypes.STRING, allowNull: true },
    companyName: {type: DataTypes.STRING, allowNull: true },
    comment: {type: DataTypes.TEXT, allowNull: true },
    email: {type: DataTypes.STRING, allowNull: true,
    validate:{
      validateEmail: function(val, next) {
        if (this.requiredEmail) {
          if (!(constants.emailRegExp.test(val))) {
            return next("Invalid e-mail format");
          }
        }

        if (!!val) {
          User.findOne({
            attributes: ['email', 'id'],
            where: {
              email: val,
              id: { $ne: this.id }
            }
          }).then(function (user) {
            if(user){
              next('already taken');
            }else{
              next();
            }
          });
        }else{
          next();
        }
      }
    }},
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
    mobile: {type: DataTypes.STRING, allowNull: true},
    tipsAndUpdate: {type: DataTypes.ENUM, values: ['off', 'on'], allowNull: false, defaultValue: 'on'},
  },{
      classMethods: {
        associate: function(models) {
          User.hasMany(models.SocialProfile, { foreignKey: 'userId'});
          User.hasMany(models.SessionMember, { foreignKey: 'userId'});
          User.belongsToMany(models.Vote, { through: {model: models.VotesBy}, foreignKey: 'voteId' });
          User.belongsToMany(models.Account, { through: { model: models.AccountUser} });
          User.belongsToMany(models.Account, { through: { model: models.AccountUser, scope: { owner: true }},  as: 'OwnerAccount'}
          );
        }
      }
    }
);
  return User;
};
