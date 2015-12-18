'use strict';

var constants = require('../util/constants');

module.exports = (Sequelize, DataTypes) => {
  var PromotionCode = Sequelize.define('PromotionCode', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: { msg: ' already taken' }, validate: { notEmpty: { args: true, msg: "can't be empty" } } },
    code: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: { args: true, msg: "can't be empty" } } },
    startDate: { type: DataTypes.DATE, allowNull: false, validate: { notEmpty: { args: true, msg: "can't be empty" } } },
    endDate: { type: DataTypes.DATE, allowNull: false, validate: { notEmpty: { args: true, msg: "can't be empty" } } },
    discountType: { type: DataTypes.ENUM, allowNull: false, values: constants.promotionCodeTypes,
      validate: {
        notEmpty: { args: true, msg: "can't be empty" },
        isValueAsDiscountType: function(value) {
          if(value == 'value' && !this.minimalOrder) {
            throw new Error(" You haven't provided valid Minimal Order");
          }
        }
      }
    },
    discountValue: { type: DataTypes.INTEGER, allowNull: false, validate: { notEmpty: { args: true, msg: "can't be empty" } } },
    minimalOrder: { type: DataTypes.INTEGER, allowNull: true }
  }, {
    indexes: [{
      unique: true,
      fields: ['name', 'code']
    }]
  });

  return PromotionCode;
};
