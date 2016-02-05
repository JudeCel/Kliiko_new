"use strict";

module.exports = (Sequelize, DataTypes) => {
  var SessionMember = Sequelize.define('SessionMember', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    accountUserId: {type: DataTypes.INTEGER, allowNull: false,
      references: { model: Sequelize.AccountUser, key: 'id' }
    },
    token: { type: DataTypes.STRING, allowNull: true, unique: true },
    username: { type: DataTypes.STRING, allowNull: false },
    colour: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 6710886 },
    online: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    avatar_info: { type: DataTypes.STRING, allowNull: false, defaultValue: '0:3:0:0:0:0' },
    sessionId: {type: DataTypes.INTEGER, allowNull: false, references: { model: Sequelize.Session, key: 'id' } },
    role: {type: DataTypes.ENUM, allowNull: false,
      values: ["facilitator", "observer", "participant"]
  }
  },{
    indexes: [ { fields: ['token'] } ],
    timestamps: true,
    paranoid: true,
    classMethods: {
      associate: function(models) {
        SessionMember.belongsTo(models.Session, {foreignKey: 'sessionId'});
        SessionMember.belongsTo(models.AccountUser, {foreignKey: 'accountUserId'});
        SessionMember.hasMany(models.Event, {foreignKey: 'sessionMemberId'} );
      }
    }
  }
);

  return SessionMember;
};
