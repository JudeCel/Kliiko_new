'use strict';
var constants = require('./../util/constants');

function filter(params) {
  if (!params || !params.role) {
    throw "Terms of Use filter:  role not given"
  }

  if (params.role === "participant") {
    return constants.externalLinks.termsOfUseGuest;
  } else {
    return constants.externalLinks.termsOfUse;
  }
}

module.exports = {
  filter: filter
};
