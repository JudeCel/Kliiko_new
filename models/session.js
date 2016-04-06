'use strict';

module.exports = (Sequelize, DataTypes) => {
  var Session = Sequelize.define('Session', {
    id:	 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    brand_project_id: { type: DataTypes.INTEGER, allowNull: true },
    accountId: { type: DataTypes.INTEGER, allowNull: false  },
    brandProjectPreferenceId: { type: DataTypes.INTEGER, allowNull: true  },
    name:	{ type: DataTypes.STRING, allowNull: false, default: 'untitled' },
    startTime:	{ type: DataTypes.DATE, allowNull: false  },
    endTime:	{ type: DataTypes.DATE, allowNull: false  },
    incentive_details: { type: DataTypes.TEXT, allowNull: true  },
    active:	{ type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    activeId:{ type: DataTypes.INTEGER, allowNull: true },
    colours_used: { type: DataTypes.TEXT, allowNull: true }
  }, {
    timestamps: true,
    classMethods: {
      associate: function(models) {
        Session.belongsTo(models.BrandProject, { foreignKey: 'brand_project_id' });
        Session.belongsTo(models.Account, { foreignKey: 'accountId' });
        Session.belongsTo(models.BrandProjectPreference, { foreignKey: 'brandProjectPreferenceId' });
        Session.belongsToMany(models.Topic, { through: { model: models.SessionTopics} } );
        Session.hasMany(models.SessionMember, { foreignKey: 'sessionId', onDelete: 'cascade' });
      }
    }
  });

  return Session;
};
