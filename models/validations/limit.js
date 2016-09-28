'use strict';

function limit(limit) {
  return function(data, options, next) {
    this.count({ where: { accountId: data.accountId } }).then(function(c) {
      if(c >= limit) {
        next(`You can have maximum amount of ${data.$modelOptions.name.plural} - ${limit}`);
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
