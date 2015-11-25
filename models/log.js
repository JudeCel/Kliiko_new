"use strict";

module.exports = (Sequelize, DataTypes) => {
  var Log = Sequelize.define('Log', {
    id:	 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    user_id: { type: DataTypes.INTEGER, allowNull: false},
    type: { type: DataTypes.STRING, allowNull: true},
    timestamp: { type: DataTypes.INTEGER, allowNull: false},
  },
   {
      // indexes: [],
      timestamps: false,
      tableName: 'logs',
      paranoid: true,
      classMethods: {
        associate: function(models) {
          Log.belongsTo(models.User, {foreignKey: 'user_id'});
        }
      }
    }
);
  return Log;
};
