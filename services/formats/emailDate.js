'use strict';

var moment = require('moment');

module.exports = {
  format: format
}

function format(type, date) {
  if(type == 'date') {
    return moment.utc(date).format('dddd Do MMMM');
  }
  else if(type == 'time') {
    let formated = moment.utc(date).format('h:mma');
    return formated.replace(':00', '');
  }
}
