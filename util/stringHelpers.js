'use strict';

var crc32 = require('crc-32');

module.exports = {
  lowerCaseFirstLetter: lowerCaseFirstLetter,
  hash: hash,
  camel2Human: camel2Human
};

function lowerCaseFirstLetter(string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}

function hash(val) {
  let valToHash = val == null || val == undefined ? "" : val.toString();
  return crc32.str(valToHash);
}

function camel2Human(val) {
  return val.replace(/([A-Z])/g, ' $1').replace(/^./, function(str){ return str.toUpperCase(); });
}