'use strict';

module.exports = {
  lowerCaseFirstLetter: lowerCaseFirstLetter
};

function lowerCaseFirstLetter(string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}
