"use strict";

module.exports = (Sequelize, DataTypes) => {
  var BrandProjectPreference = Sequelize.define('BrandProjectPreference', {
    id:	 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    sessionId: { type: DataTypes.INTEGER, allowNull: false},
    brand_project_id:	{ type: DataTypes.INTEGER, allowNull: false},
    colour_browser_background: { type: DataTypes.STRING, allowNull: false, defaultValue: "#def1f8"},
    colour_background:	{ type: DataTypes.STRING, allowNull: false,  defaultValue: "#fff"},
    colour_border:	{ type: DataTypes.STRING, allowNull: false,  defaultValue: "#e51937"},
    colour_whiteboard_background:	{ type: DataTypes.STRING, allowNull: false, defaultValue: "#e1d8d8"},
    colour_whiteboard_border:	{ type: DataTypes.STRING, allowNull: false, defaultValue: "#a4918b"},
    colour_whiteboard_icon_background:	{ type: DataTypes.STRING, allowNull: false, defaultValue: "#408d2"},
    colour_whiteboard_icon_border:	{ type: DataTypes.STRING, allowNull: false, defaultValue: "#a4918b"},
    colour_menu_background:	{ type: DataTypes.STRING, allowNull: false, defaultValue: "#679fd2"},
    colour_menu_border:	{ type: DataTypes.STRING, allowNull: false, defaultValue: "#043a6b"},
    colour_icon:	{ type: DataTypes.STRING, allowNull: false, defaultValue: "#e51937"},
    colour_text:	{ type: DataTypes.STRING, allowNull: false, defaultValue: "#e51937"},
    colour_label:	{ type: DataTypes.STRING, allowNull: false, defaultValue: "#679fd2"},
    colour_button_background:	{ type: DataTypes.STRING, allowNull: false, defaultValue: "#a66500"},
    colour_button_border:	{ type: DataTypes.STRING, allowNull: false, defaultValue: "#ffc973"}
  },
   {
      timestamps: true,
      tableName: 'brand_project_preferences',
      paranoid: true,
      classMethods: {
        associate: function(models) {
          BrandProjectPreference.belongsTo(models.Session, {foreignKey: 'sessionId'});
          BrandProjectPreference.belongsTo(models.BrandProject, {foreignKey: 'brand_project_id'});
        }
      }
    }
);
  return BrandProjectPreference;
};
