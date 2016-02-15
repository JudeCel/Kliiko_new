'use strict';
var _ = require('lodash');

function unique(sequelize, model, fieldName, otherValue) {
  return function(value, next) {
    if(value) {
      let where = {};
      if(otherValue) {
        if(otherValue.lower) {
          where[fieldName] = sequelize.fn('lower', value);
        }
      }
      else {
        where[fieldName] = value;
      }
      where.id = { $ne: this.id };

      sequelize.models[model].find({ where: where }).then(function(result) {
        if(result) {
          next(`${_.startCase(fieldName)} must be unique`);
        }
        else {
          next();
        }
      });
    }
    else {
      next();
    }
  }
};

module.exports = {
  unique: unique
};
