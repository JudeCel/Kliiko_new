'use strict';

var crc32 = require('crc-32');

module.exports = {
  lowerCaseFirstLetter: lowerCaseFirstLetter,
  hash: hash
};

function lowerCaseFirstLetter(string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}

function hash(val) {
  let valToHash = val == null || val == undefined ? "" : val.toString();
  return crc32.str(valToHash);
}