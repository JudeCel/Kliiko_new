"use strict";
var express = require('express');
var router = express.Router();
var users_repo = require('./../repositories/users.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.session.usser);
  res.render('index', { title: ''});
});

router.get('/registration', function(req, res, next) {
  res.render('registration', users_repo.prepare_params(req));
});

router.post('/registration', function(req, res, next) {
  users_repo.create(users_repo.prepare_params(req), function(error, result) {
    if (error) {
      res.render('registration', users_repo.prepare_params(req, users_repo.prepare_erros(error)));
    }else{
      users_repo.session(result.email, result.password, function(failed, result) {
        if (failed) {
          res.render('login', { title: 'Login', error: "Wrong email or password"})
        }else{
          req.login(result, function(err) {
            res.redirect(status, "/")
          });
        };
      });
    };
  });
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login', error: ""});
});

router.post('/login', function(req, res, next) {
  users_repo.session(req.body.email, req.body.password, function(failed, result) {
    if (failed) {
      res.render('login', { title: 'Login', error: "Wrong email or password"})
    }else{
      req.login(result, function(err) {
        res.redirect(200, "/")
      });
    };
  })
});


module.exports = router;
