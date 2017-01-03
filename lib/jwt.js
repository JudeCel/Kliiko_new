'use strict';

const {SessionMember, AccountUser, User} = require('./../models');
const jwt = require('jsonwebtoken');
const sessionServices = require('./../services/session');
const MessagesUtil = require('./../util/messages');
const JWTSecret = process.env.JWT_SECRET_KEY;
const algorithm = 'HS512';
const issuer = 'KlziiChat';
const Bluebird = require('bluebird');

const DAYS = 3;
const MILISECONDS = 100;

function token(id, type, callback_url) {
  const payload = {
    aud: (type + id) || `AccountUser:${id}`,
    sub: (type + id) || `AccountUser:${id}`,
    exp: expDate(),
    iss: issuer,
    typ: 'token',
    callback_url: callback_url
  }

  return jwt.sign(payload, JWTSecret, { algorithm: algorithm });
}

function tokenForMember(userId, sessionId, callback_url) {
  return new Bluebird((resolve, reject) => {
    SessionMember.find({
      where: { sessionId: sessionId },
      include: [{
        model: AccountUser,
        required: true,
        where: {
          UserId: userId
        }
      }]
    }).then((result) => {
      if(result) {
        resolve({ token: token(result.id, 'SessionMember:', callback_url)});
      } else {
        reject(MessagesUtil.lib.jwt.notPart);
      }
    }, (error) => {
      reject(error);
    });
  });
}

function expDate() {
  return Math.ceil(new Date().setDate(new Date().getDate() + DAYS) / MILISECONDS);
}

const loadResources = (payloade) => {
  let responseObject = { user: null, accountUser: null}
  return new Bluebird((resolve, reject) => {
    let [aud, id] = payloade.aud.split(":")

    if (payloade.aud.split(":")[0] == 'User') {
      User.find({where: {id: id}}).then((user) => {
        if (user) {
          resolve(user);
        }else{
          reject("User not Found");
        }
      });
    }else if (payloade.aud.split(":")[0] == 'AccountUser') {
      User.find({
        include: [{
          model: AccountUser,
          required: true,
          where: {id: id}
        }]
      }).then((user) => {
        if (user) {
          resolve(user);
        }else{
          reject("User not Found");
        }
      });
    }
  });
}

module.exports = {
  token: token,
  loadResources: loadResources,
  tokenForMember: tokenForMember
}
