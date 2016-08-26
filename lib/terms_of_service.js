'use strict';
var helpers = require('../mailers/helpers');

function filter(params) {
  if (!params.role) {
    throw "Terms of Use filter:  role not given"
  }
  if (params && params.role == "participant") {
    return  helpers.getUrl('', '/terms_of_use_participant')
  } else {
    return  helpers.getUrl('', '/terms_of_use')
  }
}

module.exports = {
  filter: filter
}
