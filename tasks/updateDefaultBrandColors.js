'use strict';

const logic = require('./updateDefaultBrandColorsLogic.js');

logic.update()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit();
  });
