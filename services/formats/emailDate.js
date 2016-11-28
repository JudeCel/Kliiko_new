'use strict';

var moment = require('moment-timezone');

module.exports = {
  format: format
}

function format(type, dateTime, timeZone) {

    if(type == 'date') {
      return moment.tz(dateTime, timeZone).format('dddd Do MMMM');
    } else if(type == 'time') {
      let formated = moment.tz(dateTime, timeZone).format('h:mma');
      return formated.replace(':00', '');
    } else if(type == 'timeZone') {
      let val = moment.tz(dateTime, timeZone);
      let formated1 = val.format('z');
      let formated2 = val.format('Z');
      return formated1.indexOf('-') == 0 || formated1.indexOf('+') == 0 ? ("UTC" + formated2) : (formated1 + formated2);
    } else {
      throw("unknown format");
    }

}
