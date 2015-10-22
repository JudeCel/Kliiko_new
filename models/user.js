"use strict";
var bcrypt = require('bcrypt');

module.exports = (Sequelize, DataTypes) => {
  var User = Sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    first_name: {type: DataTypes.STRING, allowNull: false, validate: { notEmpty: {args: true, msg: "can't be empty"} } },
    last_name: {type: DataTypes.STRING, allowNull: false, validate: { notEmpty: {args: true, msg: "can't be empty"} } },
    email: {type: DataTypes.STRING, allowNull: false, unique: {args: true, msg: "already taken"},
    validate: { notEmpty: {args: true, msg: "can't be empty"} , isEmail : {args: true, msg: "is wrong format"} }},
    display_name: {type: DataTypes.STRING, allowNull: false, unique: {args: true, msg: "already taken"}, validate: { notEmpty: {args: true, msg: "can't be empty"} }},
    encrypted_password:  {type : DataTypes.STRING, allowNull: false, validate: { notEmpty: true}},
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
          throw new Error("too short, must be at least 7 characters");
          }
        }
      }
    },
    reset_password_token: {type : DataTypes.STRING, allowNull: true},
    reset_password_sent_at: {type : DataTypes.DATE, allowNull: true},
    promo_code: {type: DataTypes.INTEGER, allowNull: true}
  }, { underscored: true }
);

  return User;
};
