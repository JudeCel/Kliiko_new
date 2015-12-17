"use strict";

module.exports = (Sequelize, DataTypes) => {
  var PromotionCode = Sequelize.define('PromotionCode', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: { args: true, msg: 'already taken' } },
    code: { type: DataTypes.STRING, allowNull: false, unique: { args: true, msg: 'already taken' } },
    startDate: { type: DataTypes.DATE, allowNull: false },
    endDate: { type: DataTypes.DATE, allowNull: false },
    discounType: { type: DataTypes.ENUM, allowNull: false, values: ['value', 'percentage'] },
    discountValue: { type: DataTypes.INTEGER, allowNull: false }
  });

  return PromotionCode;
};
