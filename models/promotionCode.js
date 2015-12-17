'use strict';

var constants = require('../util/constants');

module.exports = (Sequelize, DataTypes) => {
  var PromotionCode = Sequelize.define('PromotionCode', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: { msg: 'already taken' } },
    code: { type: DataTypes.STRING, allowNull: false, unique: { msg: 'already taken' } },
    startDate: { type: DataTypes.DATE, allowNull: false },
    endDate: { type: DataTypes.DATE, allowNull: false },
    discountType: { type: DataTypes.ENUM, allowNull: false, values: constants.promotionCodeTypes,
      validate: {
        isValueAsDiscountType: function(value) {
          if(value == 'value' && !this.minimalOrder) {
            throw new Error("You haven't provided valid Minimal Order");
          }
        }
      }
    },
    discountValue: { type: DataTypes.INTEGER, allowNull: false },
    minimalOrder: { type: DataTypes.INTEGER, allowNull: true }
  });

  return PromotionCode;
};
