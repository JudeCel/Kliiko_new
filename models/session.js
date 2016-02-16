'use strict';

module.exports = (Sequelize, DataTypes) => {
  var Session = Sequelize.define('Session', {
    id:	 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    brand_project_id: { type: DataTypes.INTEGER, allowNull: true },
    accountId: { type: DataTypes.INTEGER, allowNull: false  },
    resourceId: { type: DataTypes.INTEGER, allowNull: true  },
    brandProjectPreferenceId: { type: DataTypes.INTEGER, allowNull: true  },
    name:	{ type: DataTypes.STRING, allowNull: false, defaultValue: 'untitled' },
    startTime:	{ type: DataTypes.DATE, allowNull: false, defaultValue: Date.now() },
    endTime:	{ type: DataTypes.DATE, allowNull: false , defaultValue: Date.now() },
    incentive_details: { type: DataTypes.TEXT, allowNull: true  },
    active:	{ type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    colours_used: { type: DataTypes.TEXT, allowNull: true },
    // The order for step array is important always keep right order!!!
    step: { type: DataTypes.ENUM, allowNull: false,
      values: ['setUp', 'facilitatiorAndTopics', 'manageSessionEmails',
        'manageSessionParticipants', 'inviteSessionObservers', 'done'
      ], defaultValue: 'setUp' }
  }, {
    timestamps: true,
    classMethods: {
      associate: function (models) {
        Session.belongsTo(models.BrandProject, {foreignKey: 'brand_project_id'});
        Session.belongsTo(models.Account, {foreignKey: 'accountId'});
        Session.belongsTo(models.BrandProjectPreference, {foreignKey: 'brandProjectPreferenceId'});
        Session.belongsToMany(models.Topic, {through: {model: models.SessionTopics}});
        Session.belongsTo(models.Resource, { foreignKey: 'resourceId' });
        Session.hasMany(models.SessionMember, {foreignKey: 'sessionId', onDelete: 'cascade'});
      }
    }
  }
);
  return Session;
};
