'use strict';

const logic = require('./updateSubscriptionPlansLogic.js');

logic.update()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit();
  });
