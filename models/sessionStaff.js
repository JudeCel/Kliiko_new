"use strict";

module.exports = (Sequelize, DataTypes) => {
  var SessionStaff = Sequelize.define('SessionStaff', {
    id:	 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    userId: { type: DataTypes.INTEGER, allowNull: false},
    topicId:	{type: DataTypes.INTEGER, allowNull: false},
    sessionId:	{ type: DataTypes.INTEGER, allowNull: false},
    comments:	{type: DataTypes.TEXT, allowNull: true},
    type:	{type: DataTypes.STRING, allowNull: true},
    active:	{type: DataTypes.BOOLEAN, allowNull: false}

  },
   {
      // indexes: [],
      timestamps: true,
      tableName: 'session_staff',
      paranoid: true,
      classMethods: {
        associate: function(models) {
          SessionStaff.belongsTo(models.Session, { foreignKey: 'sessionId' });
        }
      }
    }
);
  return SessionStaff;
};
