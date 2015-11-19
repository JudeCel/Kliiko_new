"use strict";
var usersService = require('./users');
var async = require('async');
var mailers = require('../mailers');

function sendToken(email, callback) {
    async.waterfall([
        function (next) {
            usersService.setResetToken(email, next);
        },
        function (token, next) {
            if (!token) {
                return next(new Error('E-mail not found'));
            }

            let params = {
                token: token,
                email: email
            };
            mailers.users.sendResetPasswordToken(params, next);
        }
    ], callback);
}

function resetByToken(req, callback) {
    usersService.getUserByToken(req.params.token, function (err, user) {
        if (err) {
            return callback(err);
        }
        usersService.resetPassword(req.params.token, req.body.password, function (err, data) {
            if (err) {
                return callback(err);
            }
            callback(null, user);
        });
    });
}
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
function checkTokenExpired(token, callback) {

    usersService.getUserByToken(token, function (err, user) {

        if (err || !user) {
            return callback(new Error('User not found'));
        }

        let tokenCreated = new Date(user.get("resetPasswordSentAt"));
        let tokenEnd = tokenCreated.setHours(tokenCreated.getHours() + 24);
        let now = new Date().getTime();
        if (now > tokenEnd) {
            user = null;
        }
        callback(null, user);
    });
}

module.exports = {
    sendToken: sendToken,
    resetByToken: resetByToken,
    checkTokenExpired: checkTokenExpired,
    sendTokenEmailConfirmation: sendTokenEmailConfirmation,
    getEmailConfirmationByToken: getEmailConfirmationByToken
}
