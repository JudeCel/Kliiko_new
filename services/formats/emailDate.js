'use strict';

var moment = require('moment-timezone');

module.exports = {
  format: format
}

function format(type, date) {
  if(type == 'date') {
    return moment(date).format('dddd Do MMMM');
  }
  else if(type == 'time') {
    let formated = moment(date).format('h:mma');
    return formated.replace(':00', '');
  }
}
