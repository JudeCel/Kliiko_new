'use strict';

var subdomains = require('../../lib/subdomains.js');

function views_path(action) {
  return 'my-dashboard/' + action;
};

function index(req, res, next) {
  if(req.user && !res.locals.currentDomain) {
    res.render(views_path('index'), { title: 'My Dashboard' });
  } else {
    res.redirect(subdomains.url(req, subdomains.base, '/'));
  }
};

module.exports = {
  index: index
};
