'use strict';

const logic = require('./updateDefaultResourceNameLogic.js');

logic.call()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit();
  });
