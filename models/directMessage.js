'use strict';

module.exports = (Sequelize, DataTypes) => {
  var DirectMessage = Sequelize.define('DirectMessage', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    senderId: { type: DataTypes.INTEGER, allowNull: false },
    recieverId: { type: DataTypes.INTEGER, allowNull: false },
    sessionId: { type: DataTypes.INTEGER, allowNull: false },
    readAt: { type : DataTypes.DATE, allowNull: true },
    text: { type : DataTypes.TEXT, allowNull: false, validate: { notEmpty: true } }
  }, {
    timestamps: true,
    classMethods: {
      associate: function(models) {
        DirectMessage.belongsTo(models.Session, { foreignKey: 'sessionId', onDelete: 'cascade' });
        DirectMessage.belongsTo(models.SessionMember, { foreignKey: 'senderId', as: 'sender', onDelete: 'cascade' });
        DirectMessage.belongsTo(models.SessionMember, { foreignKey: 'recieverId', as: 'reciever', onDelete: 'cascade' });
      }
    }
  });

  return DirectMessage;
};
