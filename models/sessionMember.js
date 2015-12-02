"use strict";

module.exports = (Sequelize, DataTypes) => {
  var SessionMember = Sequelize.define('SessionMember', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    user_id: {type: DataTypes.INTEGER, allowNull: false},
    username: {type: DataTypes.STRING, allowNull: false},
    colour:
    online:
    avatar_info
    // TODO: need implemented account also
    // account_id: {type: DataTypes.INTEGER, allowNull: false},
    session_id: {type: DataTypes.INTEGER, allowNull: false},
    role: {type: DataTypes.ENUM, allowNull: false,
      values: ["admin", "owner", "observer", "participant"]
  }
  },{
    timestamps: true,
    paranoid: true,
    classMethods: {
      associate: function(models) {
        SessionMember.belongsTo(models.Session, {foreignKey: 'session_id'});
        SessionMember.belongsTo(models.User, {foreignKey: 'user_id'});
        // SessionMember.belongsTo(models.Account, {foreignKey: 'account_id'});
      }
    }
  }
);

  return SessionMember;
};
