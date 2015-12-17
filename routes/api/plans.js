/**
 * Work with plans
 * GET /plans
 *
 * @type {exports|module.exports}
 */

var plans = {
    'single': {price: 180 },
    'monthly': {price: 50 },
    'annual': {price: 550 }
};

function plansGet(req, res, next) {
  res.send(plans);
}

module.exports = {
  plansGet: plansGet,
}
