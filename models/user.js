"use strict";
var bcrypt = require('bcrypt');

module.exports = (Sequelize, DataTypes) => {
  var User = Sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    first_name: {type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
    last_name: {type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
    email: {type: DataTypes.STRING, allowNull: false, unique: true, validate: { notEmpty: true, isEmail : true}},
    encrypted_password:  {type : DataTypes.STRING, allowNull: false, validate: { notEmpty: true }},
    password: {
      type: DataTypes.VIRTUAL,
      set: function(val) {
        this.setDataValue('password', val);
        if (val) {
          this.setDataValue('encrypted_password', bcrypt.hashSync(val, 10))
        };
      },
      validate: {
        isLongEnough: function(value) {
          if(value.length < 7) {
          throw new Error("Please choose a longer password");
          }
        }
      }
    },
    reset_password_token: {type : DataTypes.STRING, allowNull: true},
    reset_password_sent_at: {type : DataTypes.DATE, allowNull: true},
    current_sign_in_ip: {type : DataTypes.STRING, allowNull: true},
    last_sign_in_ip: {type : DataTypes.STRING, allowNull: true},
    promo_code: {type: DataTypes.INTEGER, allowNull: true}
  }, { underscored: true }
);

  return User;
};
