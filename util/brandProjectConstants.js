'use strict';
var _ = require('lodash');

module.exports = {
  preferenceColours: function(colors) {
    return _.assign({
      browserBackground: '#FFFFFF',
      mainBackground: '#FFFFFF',
      mainBorder: '#F0E935',
      font: '#58595B',
      headerButton: '#4CBFE9',
      consoleButton: {
        active: '#4CB649'
      },
      participants: {
        '1': '#4CB649',
        '2': '#2F9F69',
        '3': '#9B0E26',
        '4': '#3F893B',
        '5': '#7F7426',
        '6': '#27606D',
        '7': '#F0E935',
        '8': '#4CBFE9',
      }
    }, colors);
  }
}
