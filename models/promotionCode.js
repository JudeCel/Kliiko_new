'use strict';

var constants = require('../util/constants');
var validations = require('./validations');

module.exports = (Sequelize, DataTypes) => {
  var PromotionCode = Sequelize.define('PromotionCode', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false, validate: {
      notEmpty: true,
      isUnique: validations.unique(Sequelize, 'PromotionCode', 'name')
    } },
    code: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
    startDate: { type: DataTypes.DATE, allowNull: false, validate: { notEmpty: true } },
    endDate: { type: DataTypes.DATE, allowNull: false, validate: { notEmpty: true } },
    discountType: { type: DataTypes.ENUM, allowNull: false, values: constants.promotionCodeTypes,
      validate: {
        notEmpty: true,
        isValueAsDiscountType: function(value) {
          if(value == 'value') {
            if(!this.minimalOrder) {
              throw new Error("You haven't provided valid Minimal Order");
            }
            else if(this.minimalOrder < 0) {
              throw new Error("Please provide minimal order value greater then 0.");
            }
          }
          else if(value == "percentage"){
            if(this.discountValue < 0 || this.discountValue > 100){
              throw new Error("Please provide percentage that's between 0-100.");
            }
          }
        }
      }
    },
    discountValue: { type: DataTypes.INTEGER, allowNull: false,
      validate: {
        notEmpty: true,
        isValidNumber: function(value) {
          if(value < 0){
            throw new Error("Please provide discount value greater then 0.");
          }
        }
      }
    },
    minimalOrder: { type: DataTypes.INTEGER, allowNull: true }
  }, {
    indexes: [{
      unique: true,
      fields: ['name', 'code']
    }]
  });

  return PromotionCode;
};
