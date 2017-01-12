'use strict';

var subdomains = require('../../lib/subdomains.js');
var jwtToken = require('../../lib/jwt.js');

module.exports = {
  index: index,
  tour: tour
};

function views_path(action) {
  return 'my-dashboard/' + action;
};

function index(req, res, next) {
  if(req.user && !req.currentResources) {
    let token  = jwtToken.token(req.user.id, "User:", "/" )
    res.render(views_path('index'), { title: 'My Dashboard', jwt_token: token});
  } else {
    res.redirect(subdomains.url(req, subdomains.base, '/'));
  }
};

function tour(req, res, next) {
  res.render(views_path('tour'), { title: 'Tour videos' });
};
