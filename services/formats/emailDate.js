'use strict';

var moment = require('moment-timezone');

module.exports = {
  format: format
}

function format(type, date, timeZone) {
  if(!timeZone) {
    timeZone = 'Europe/London'
  }

  if(type == 'date') {
    return moment.utc(date).tz(timeZone).format('dddd Do MMMM');
  }
  else if(type == 'time') {
    let formated = moment.utc(date).tz(timeZone).format('h:mma');
    return formated.replace(':00', '');
  }
}
