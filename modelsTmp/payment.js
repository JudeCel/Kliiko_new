"use strict";
/**
 * If default value == 0, then it  means UNLIMITED
 */
module.exports = (Sequelize, DataTypes) => {
    var Payment = Sequelize.define('Payment', {
        id:	 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        totalAmount: { type: DataTypes.INTEGER, allowNull: false,  defaultValue: 0},
        taxAmount: { type: DataTypes.INTEGER, allowNull: false,  defaultValue: 0},
        discountAmount: { type: DataTypes.INTEGER, allowNull: false,  defaultValue: 0},

        durationInMonths: { type: DataTypes.INTEGER, allowNull: false,  defaultValue: 1},

        step: { type: DataTypes.ENUM, allowNull: false, values: [1,2,3,4,5]},
        country: { type: DataTypes.STRING, allowNull: false},
        currency: { type: DataTypes.STRING, allowNull: false},

    },
        {
            // indexes: [],
            timestamps: true,
            tableName: 'payments',
            paranoid: true,
            classMethods: {
                associate: function(models) {
                    Payment.belongsTo(models.Plan);
                    Payment.belongsTo(models.User);
                    Payment.belongsTo(models.Account);
                    Payment.belongsTo(models.Promocode);
                    //Payment.belongsTo(models.Invoices);
                }
            }
        }
    );

    return Payment;
};
