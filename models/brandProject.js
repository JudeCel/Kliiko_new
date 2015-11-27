"use strict";

module.exports = (Sequelize, DataTypes) => {
  var BrandProject = Sequelize.define('BrandProject', {
    id:	 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    client_company_type:	{ type: DataTypes.STRING, allowNull: false},
    logo_resource_id:	{ type: DataTypes.STRING, allowNull: true},
    address_id:	{ type: DataTypes.STRING, allowNull: true},
    billing_address_id:	{ type: DataTypes.STRING, allowNull: true},
    name:	{ type: DataTypes.STRING, allowNull: false},
    URL:	{ type: DataTypes.STRING, allowNull: false},
    ABN:	{ type: DataTypes.STRING, allowNull: false},
    start_date:	{ type: DataTypes.DATE },
    end_date:	{ type: DataTypes.DATE },
    number_of_brands:	{ type: DataTypes.STRING, allowNull: true},
    max_sessions_brand:	{ type: DataTypes.STRING, allowNull: true},
    max_number_of_observers:	{ type: DataTypes.STRING, allowNull: true},
    self_moderated:	{ type: DataTypes.STRING, allowNull: false},
    global_admin:	{ type: DataTypes.STRING, allowNull: false},
    comments:	{ type: DataTypes.TEXT, allowNull: false},
    client_company_logo_url: { type: DataTypes.TEXT, allowNull: false},
    client_company_logo_thumbnail_url:	{ type: DataTypes.TEXT, allowNull: false},
    enable_chatroom_logo:	{ type: DataTypes.INTEGER, allowNull: false, default: 0}


  },
   {
      timestamps: true,
      tableName: 'brand_projects',
      paranoid: true,
      classMethods: {
        associate: function(models) {
          // Log.belongsTo(models.User, {foreignKey: 'user_id'});
        }
      }
    }
);
  return BrandProject;
};
