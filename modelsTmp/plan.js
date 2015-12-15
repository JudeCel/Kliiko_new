"use strict";
/**
 * If default value == 0, then it  means UNLIMITED
 */
module.exports = (Sequelize, DataTypes) => {
    var Plan = Sequelize.define('Plan', {
        id:	 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        name: { type: DataTypes.STRING, allowNull: false},
        price: { type: DataTypes.INTEGER, allowNull: false,  defaultValue: 0},
        currency: { type: DataTypes.STRING, allowNull: false,  defaultValue: 'USD'},
        durationInMonths: { type: DataTypes.INTEGER, allowNull: false,  defaultValue: 1},

        sessionIncluded: { type: DataTypes.INTEGER, allowNull: false,  defaultValue: 1},
        smsIncluded:  { type: DataTypes.INTEGER, allowNull: false,  defaultValue: 1},
        observersIncluded:  { type: DataTypes.INTEGER, allowNull: false,  defaultValue: 1},
        participantsIncluded:  { type: DataTypes.INTEGER, allowNull: false,  defaultValue: 1},
        contactListAmount:  { type: DataTypes.INTEGER, allowNull: false,  defaultValue: 0},

        repeatable: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false}
    },
    {
        // indexes: [],
        timestamps: true,
        tableName: 'plans',
        paranoid: true,
        classMethods: {
            associate: function(models) {
                Plan.hasMany(models.Payment);
            }
        }
    }
);

return Plan;
};
