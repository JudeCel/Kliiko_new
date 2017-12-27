'use strict';
const sessionTypeService = require('./../services/sessionType.js');
const models = require('../models');

sessionTypeService.updateSessionTypes()
  .then(() => {
    return models.update(
      {
        role: 'participant',
      },
      {
        where: {
          role: 'observer',
          typeOfCreation: 'system',
        },
      }
    );
  })
  .then(function () {
    process.exit();
  }, function (error) {
    process.exit();
  });
