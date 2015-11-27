"use strict";

module.exports = (Sequelize, DataTypes) => {
  var BrandProjectPreference = Sequelize.define('BrandProjectPreference', {
    id:	 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    session_id: { type: DataTypes.INTEGER, allowNull: false},
    brand_project_id:	{ type: DataTypes.INTEGER, allowNull: false},
    colour_browser_background: { type: DataTypes.STRING, allowNull: true, default: "#def1f8"},
    colour_background:	{ type: DataTypes.STRING, allowNull: true,  default: "#fff"},
    colour_border:	{ type: DataTypes.STRING, allowNull: true,  default: "#e51937"},
    colour_whiteboard_background:	{ type: DataTypes.STRING, allowNull: true, default: "#e1d8d8"},
    colour_whiteboard_border:	{ type: DataTypes.STRING, allowNull: true, default: "#a4918b"},
    colour_whiteboard_icon_background:	{ type: DataTypes.STRING, allowNull: true, default: "#408d2"},
    colour_whiteboard_icon_border:	{ type: DataTypes.STRING, allowNull: true, default: "#a4918b"},
    colour_menu_background:	{ type: DataTypes.STRING, allowNull: true, default: "#679fd2"},
    colour_menu_border:	{ type: DataTypes.STRING, allowNull: true, default: "#043a6b"},
    colour_icon:	{ type: DataTypes.STRING, allowNull: true, default: "#e51937"},
    colour_text:	{ type: DataTypes.STRING, allowNull: true, default: "#e51937"},
    colour_label:	{ type: DataTypes.STRING, allowNull: true, default: "#679fd2"},
    colour_button_background:	{ type: DataTypes.STRING, allowNull: true, default: "#a66500"},
    colour_button_border:	{ type: DataTypes.STRING, allowNull: true, default: "#ffc973"}
  },
   {
      timestamps: true,
      tableName: 'brand_project_preferences',
      paranoid: true,
      classMethods: {
        associate: function(models) {
          BrandProjectPreference.belongsTo(models.Session, {foreignKey: 'session_id'});
          BrandProjectPreference.belongsTo(models.BrandProject, {foreignKey: 'brand_project_id'});
        }
      }
    }
);
  return BrandProjectPreference;
};
