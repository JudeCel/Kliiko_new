'use strict';

const logic = require('./updatePlanNameLogic.js');

logic.update()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit();
  });
