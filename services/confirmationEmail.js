"use strict";
var usersService = require('./users');
var async = require('async');
var mailers = require('../mailers');


function sendTokenEmailConfirmation(email, callback) {
    async.waterfall([
        function (next) {
            usersService.setEmailConfirmationToken(email, next);
        },
        function (token, next) {
            if (!token) {
                return next(new Error('Failed create token'));
            }
            let params = {
                token: token,
                email: email
            };
            mailers.users.sendEmailConfirmationToken(params, next);
        }
    ], callback);
}

function getEmailConfirmationByToken(req, callback) {
    usersService.getUserByToken(req.params.token, function (err, user) {
        if (err) {
            return callback(err);
        }
        usersService.emailConfirmation(req.params.token, req.body.password, function (err, data) {
            if (err) {
                return callback(err);
            }
            callback(null, user);
        });
    });
}

module.exports = {
    sendTokenEmailConfirmation: sendTokenEmailConfirmation,
    getEmailConfirmationByToken: getEmailConfirmationByToken
}
