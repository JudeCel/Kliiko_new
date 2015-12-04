"use strict";

module.exports = (Sequelize, DataTypes) => {
  var SessionMember = Sequelize.define('SessionMember', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: {type: DataTypes.INTEGER, allowNull: false,
      references: { model: Sequelize.User, key: 'id' }
    },
    username: { type: DataTypes.STRING, allowNull: false },
    colour: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 6710886 },
    online: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    avatar_info: { type: DataTypes.STRING, allowNull: false, defaultValue: '0:3:0:0:0:0' },

    // TODO: need implemented account also
    // account_id: {type: DataTypes.INTEGER, allowNull: false},
    sessionId: {type: DataTypes.INTEGER, allowNull: false, references: { model: Sequelize.Session, key: 'id' } },
    role: {type: DataTypes.ENUM, allowNull: false,
      values: ["admin", "facilitator", "observer", "participant"]
  }
  },{
    timestamps: true,
    paranoid: true,
    classMethods: {
      associate: function(models) {
        SessionMember.belongsTo(models.Session, {foreignKey: 'sessionId'});
        SessionMember.belongsTo(models.User, {foreignKey: 'userId'});
        // SessionMember.belongsTo(models.Account, {foreignKey: 'account_id'});
      }
    }
  }
);

  return SessionMember;
};
