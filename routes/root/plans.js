'use strict';

const service = require('./../../services/subscription');

module.exports = {
  get
};

function get(req, res, next) {
  service.getPlansFromStore().then((plans) => {
    res.send({ plans });
  }, (error) => {
    res.status(400).send(error);
  });
}
