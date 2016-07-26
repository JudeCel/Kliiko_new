'use strict';
var _ = require('lodash');

function unique(sequelize, model, fieldName, otherValue) {
  return function(value, next) {
    if(value) {
      let where = {};
      if(otherValue) {
        if(otherValue.lower) {
          where[fieldName] = where[fieldName] = sequelize.fn('lower', value);
        }
        else {
          where[fieldName] = value;
        }

        if(otherValue.accountContext) {
          where.accountId = this.accountId;
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

function uniqueStructureSql(sequelize, model, fieldName) {
  return function(value, next) {
    let where = {
      $and: [ sequelize.where(
      sequelize.fn('regexp_replace', sequelize.fn('lower', sequelize.col(fieldName)), "\\s", '', 'g'),
      sequelize.fn('regexp_replace', sequelize.fn('lower', value), "\\s", '', 'g')
    )]}

    if (this && this.id) {
      where.id = { $ne: this.id };
    }
    sequelize.models[model].find({ where: where }).then(function(result) {
      if(result) {
        next(`${_.startCase(fieldName)} must be unique`);
      }
      else {
        next();
      }
    });
  }
};

module.exports = {
  unique: unique,
  uniqueStructureSql: uniqueStructureSql
};
