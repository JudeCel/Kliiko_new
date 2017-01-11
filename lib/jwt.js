'use strict';

const {SessionMember, AccountUser, User} = require('./../models');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
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
  let responseObject = { user: null, accountUser: null, account: null}
  return new Bluebird((resolve, reject) => {
    let [aud, id] = payloade.aud.split(":")

    if (aud == 'User') {
      User.find({where: {id: id}}).then((user) => {
        if (user) {
          responseObject.user = user.dataValues
          resolve(responseObject);
        }else{
          reject("User not Found");
        }
      });
    }else if (aud == 'AccountUser') {
      User.find({
        attributes: ['id', 'email'],
        include: [{
          model: AccountUser,
          attributes: ['id', 'role', 'AccountId'],
          required: true,
          where: {id: id}
        }]
      }).then((user) => {
        if (user) {
          responseObject.user = _.pick(user.dataValues, ['id', 'email'])
          responseObject.accountUser = _.pick(user.AccountUsers[0].dataValues, ['id', 'role'])
          responseObject.account = {id: user.AccountUsers[0].id}
          
          resolve(responseObject);
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
