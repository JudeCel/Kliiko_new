'use strict';

function limit(limit) {
  return function(data, options, next) {
    this.count({ where: { accountId: data.accountId } }).then(function(c) {
      if(c >= limit) {
        next(`You have reached ${data.$modelOptions.name.singular} limit. (${limit})`);
      }
      else {
        next(null, data);
      }
    });
  }
};

module.exports = {
  limit: limit
};
