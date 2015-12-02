"use strict";
var bcrypt = require('bcrypt');

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
    email: {type: DataTypes.STRING, allowNull: true,
    validate:{
      validateEmail: function(val, next) {
        if (this.requiredEmail) {
          let re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

          if (!(re.test(val))) {
            return next("Invalid e-mail format");
          }
        }

        if (!!val) {
          User.findOne({attributes: ['email'], where: { email: val } }).then(function (user) {
            if(user){
              return next('already taken');
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
    mobile: {type: DataTypes.STRING, allowNull: true},
    tipsAndUpdate: {type: DataTypes.ENUM, values: ['off', 'on'], allowNull: false, defaultValue: 'on'},
    gender: {type: DataTypes.ENUM, values: ['male', 'female'], allowNull: false, validate: { notEmpty: {args: true, msg: "can't be empty"} } },
    postalAdress: {type: DataTypes.STRING, allowNull: true },
    city: {type: DataTypes.STRING, allowNull: true },
    postCode: {type: DataTypes.STRING, allowNull: true },
    companyName: {type: DataTypes.STRING, allowNull: true },
    landlineNumber: {type: DataTypes.STRING, allowNull: true }
  },{
      classMethods: {
        associate: function(models) {
          User.hasMany(models.SocialProfile, {foreignKey: 'userId'});
          User.belongsToMany(models.Account, { through: models.AccountUser, foreignKey: 'accountId' });
          User.belongsToMany(models.Account, { through: { model: models.AccountUser, scope: { owner: true }},
            foreignKey: 'accountId',  as: 'OwnerAccount'}
          );
        }
      }
    }
);

  return User;
};
