'use strict';

var moment = require('moment-timezone');

module.exports = {
  format: format
}

function format(type, dateTime, timeZone) {

    if(type == 'date') {
      return moment.utc(dateTime).format('dddd Do MMMM');
    }
    else if(type == 'time') {
      let formated = moment.utc(dateTime).format('h:mma');
      return formated.replace(':00', '');
    }else {
      throw("unknown format");
    }

}
