"use strict";
var bcrypt = require('bcrypt');

module.exports = (Sequelize, DataTypes) => {
  var User = Sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    first_name: {type: DataTypes.INTEGER, allowNull: false},
    last_name: {type: DataTypes.INTEGER, allowNull: false},
    email: {type: DataTypes.STRING, allowNull: false, unique: true},
    encrypted_password:  {type : DataTypes.STRING, allowNull: false},
    password: {
      type: DataTypes.VIRTUAL,
      set: function(val) {
        this.setDataValue('password', val);
        if (val) {
          this.setDataValue('encrypted_password', bcrypt.hashSync(val, 10))
        };
      },
      validate: {
        isLongEnough: (val) => {
          if (val.length < 7) {
            throw new Error("Please choose a longer password")
          }
        }
      }
    },
    reset_password_token: {type : DataTypes.INTEGER, allowNull: true},
    reset_password_sent_at: {type : DataTypes.DATE, allowNull: true},
    current_sign_in_ip: {type : DataTypes.STRING, allowNull: true},
    last_sign_in_ip: {type : DataTypes.STRING, allowNull: true},
    created_at: {type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW},
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW},
    promo_code: {type: DataTypes.INTEGER, allowNull: true}
  }, { hooks: {
        beforeValidate: (user, options) => {
          user.updated_at = new Date();
        }
      }
    });

  return User;
};
