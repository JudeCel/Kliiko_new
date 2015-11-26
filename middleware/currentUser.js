'use strict';

function assign(req, res, next) {
  res.locals.currentUser = req.user;
  next();
}

module.exports = {
  assign: assign
}
