'use strict';

const logic = require('./removeDeactivatedLogic.js');

logic.process()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit();
  });
