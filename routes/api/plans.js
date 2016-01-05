/**
 * Work with plans
 * GET /plans
 *
 * @type {exports|module.exports}
 */

var plans = {
  'single': {
    id: 1,
    name: 'Single Plan',
    price: 180
  },
  'monthly': {
    id: 2,
    name: 'Monthly Plan',
    price: 50
  },
  'annual': {
    id: 3,
    name: 'Annual Plan',
    price: 550
  }
};

function plansGet(req, res, next) {
  res.send(plans);
}

module.exports = {
  plansGet: plansGet
};
