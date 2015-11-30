"use strict";

module.exports = (Sequelize, DataTypes) => {
  var BrandProject = Sequelize.define('BrandProject', {
    id:	 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name:	{ type: DataTypes.STRING, allowNull: false, defaultValue: "untitled"},
    client_company_logo_url: { type: DataTypes.TEXT, allowNull: true},
    client_company_logo_thumbnail_url:	{ type: DataTypes.TEXT, allowNull: true},
    enable_chatroom_logo:	{ type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    session_replay_date:	{ type: DataTypes.DATE, allowNull: false},
    moderator_active:	{ type: DataTypes.INTEGER, allowNull: false, defaultValue: 1}
  },
   {
      timestamps: true,
      paranoid: true,
      classMethods: {
        associate: function(models) {
          BrandProject.hasMany(models.Session, { foreignKey: 'session_id' });
          BrandProject.hasMany(models.BrandProjectPreference, { foreignKey: 'brand_project_id' });
        }
      }
    }
);
  return BrandProject;
};
