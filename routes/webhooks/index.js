'use strict';
let express = require('express');
let router = express.Router();
let chargebee = require('./chargebee');

module.exports = router;

// Main Routes
router.get('/chargebee/hostedPageSuccess', chargebee.chargebeeHostedPageSuccessGet);
router.get('/chargebee/tst', chargebee.tstPost);


// Common Rules
router.use(function (req, res, next) {
  if (req.user) {
    next();
  } else {
    notAuthExit(res);
  }
});

//Common not authorized message
function notAuthExit(res) {
  res.status(403).send('not authorized');
}
