"use strict";

module.exports = (Sequelize, DataTypes) => {
  var Log = Sequelize.define('Log', {
    id:	 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    userId: { type: DataTypes.INTEGER, allowNull: true},
    type: { type: DataTypes.STRING, allowNull: false}
  },
   {
      // indexes: [],
      timestamps: true,
      tableName: 'logs',
      paranoid: true,
      classMethods: {
        associate: function(models) {
          Log.belongsTo(models.User, {foreignKey: 'userId'});
        }
      }
    }
);
  return Log;
};
