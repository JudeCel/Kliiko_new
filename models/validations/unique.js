'use strict';

var _ = require('lodash');
var MessagesUtil = require('./../../util/messages');

function unique(sequelize, model, fieldName, otherValue) {
  return function(value, next) {
    if(value) {
      let where = {};
      if(otherValue) {
        if(otherValue.lower) {
          where = {
            $and: [sequelize.where(
              sequelize.fn('regexp_replace', sequelize.fn('lower', sequelize.col(fieldName)), "\\s", '', 'g'),
              sequelize.fn('regexp_replace', sequelize.fn('lower', value), "\\s", '', 'g')
            )]
          };
        } else {
          where[fieldName] = value;
        }

        if(otherValue.accountContext) {
          where.accountId = this.accountId;
        }

        if(otherValue.topicContext && this.parentTopicId) {
          where.parentTopicId = this.parentTopicId;
        }
      }
      else {
        where[fieldName] = value;
      }

      if(this && this.id) {
        where.id = { $ne: this.id };
      }

      sequelize.models[model].find({ where: where }).then(function(result) {
        if(result) {
          next(_.startCase(fieldName) + ' must be unique');
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
