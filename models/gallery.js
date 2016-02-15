"use strict";

var constants = require('../util/constants');

module.exports = (Sequelize, DataTypes) => {
  var Gallery = Sequelize.define('Gallery', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    accountId: {type: DataTypes.INTEGER, allowNull: false},
    uploadType: { type: DataTypes.ENUM, allowNull: false, values: constants.galleryUploadTypes, validate: { notEmpty: true } },
    filepath: { type: DataTypes.STRING, allowNull: false },
    link: {type: DataTypes.STRING, allowNull: true}

  },{
      classMethods: {
        associate: function(models) {
          Gallery.belongsTo(models.Account, {foreignKey: 'accountId'});
        }
      }
    }
);

  return Gallery;
};
