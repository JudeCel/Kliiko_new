"use strict";
var express = require('express');
var router = express.Router();
var users_repo = require('./../repositories/users.js');
var passport = require('passport');


router.use(function (req, res, next) {
  console.log(req.session);
  next();
});



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '', user: req.user });
});

router.get('/registration', function(req, res, next) {
  res.render('registration', users_repo.prepare_params(req));
});

router.post('/registration', function(req, res, next) {
  users_repo.create(users_repo.prepare_params(req), function(error, result) {
    if (error) {
      res.render('registration', users_repo.prepare_params(req, users_repo.prepare_erros(error)));
    }else{
      users_repo.compare_password(result.email, result.password, function(failed, result) {
        if (failed) {
          res.render('login', { title: 'Login', error: "Wrong email or password"})
        }else{
          req.login(result, function(err) {
            res.redirect("/")
          });
        };
      });
    };
  });
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login', error: ""});
});

router.post('/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    console.log(req.session);
    res.redirect('/');
  }
);

module.exports = router;
