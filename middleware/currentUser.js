'use strict';

function assign(app) {
  return function(req, res, next) {
    app.locals.currentUser = req.user;
    next();
  }
}

module.exports = {
  assign: assign
}
