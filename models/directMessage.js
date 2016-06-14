'use strict';

module.exports = (Sequelize, DataTypes) => {
  var DirectMessage = Sequelize.define('DirectMessage', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    senderId: { type: DataTypes.INTEGER, allowNull: false },
    recieverId: { type: DataTypes.INTEGER, allowNull: false },
    sessionId: { type: DataTypes.INTEGER, allowNull: false },
    readAt: { type : DataTypes.DATE, allowNull: true },
    text: { type : DataTypes.STRING, allowNull: false, validate: { notEmpty: true } }
  }, {
    timestamps: true,
    classMethods: {
      associate: function(models) {
        DirectMessage.belongsTo(models.Session, { foreignKey: 'sessionId' });
        DirectMessage.belongsTo(models.SessionMember, { foreignKey: 'senderId' });
        DirectMessage.belongsTo(models.SessionMember, { foreignKey: 'recieverId' });
      }
    }
  });

  return DirectMessage;
};
