"use strict";

module.exports = (Sequelize, DataTypes) => {
  var Session = Sequelize.define('Session', {
    id:	 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    brand_project_id: { type: DataTypes.INTEGER, allowNull: true},
    name:	{ type: DataTypes.STRING, allowNull: false, default: 'untitled'},
    start_time:	{ type: DataTypes.DATE, allowNull: false },
    end_time:	{ type: DataTypes.DATE, allowNull: false },
    incentive_details: { type: DataTypes.TEXT, allowNull: true },
    status_id:	{ type: DataTypes.INTEGER, allowNull: false},
    active_topicId:{ type: DataTypes.INTEGER, allowNull: true},
    colours_used: { type: DataTypes.TEXT, allowNull: true }
  },
   {
      // indexes: [],
      timestamps: true,
      paranoid: true,
      classMethods: {
        associate: function(models) {
          Session.belongsTo(models.BrandProject, { foreignKey: 'brand_project_id' });
          Session.hasMany(models.Topic, { foreignKey: 'sessionId' });
          Session.hasMany(models.BrandProjectPreference, { foreignKey: 'sessionId' });
          Session.hasMany(models.SessionMember, { foreignKey: 'sessionId' });
        }
      }
    }
);
  return Session;
};
