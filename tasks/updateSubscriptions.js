'use strict';

const logic = require('./updateSubscriptionsLogic.js');

logic.updateSubscriptionsEndDate()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit();
  });
