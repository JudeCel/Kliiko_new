'use strict';

const {AccountUser, User, Account, Subscription, SubscriptionPreference} = require('./../models');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const MessagesUtil = require('./../util/messages');
const perrmissions = require("./../services/permissions")
const JWTSecret = process.env.JWT_SECRET_KEY;
const algorithm = 'HS512';
const issuer = 'KlziiChat';
const Bluebird = require('bluebird');

const DAYS = 3;
const MILISECONDS = 100;
let ACCOUNT_USER_ATTRS = [
  'id', 'role', 'firstName', 'lastName', 'email', 'phoneCountryData',
  'landlineNumberCountryData', 'AccountId', 'gender','mobile', 'landlineNumber',
  'companyName', 'country', 'postCode', 'state', 'city', 'postalAddress', 'emailNotification'
  ];
let ACCOUNT_ATTRS = ['id', 'name', 'subdomain', 'admin'];

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

function expDate() {
  return Math.ceil(new Date().setDate(new Date().getDate() + DAYS) / MILISECONDS);
}

const refresToken = (claims, resources) =>{
  let [aud, id] = claims.aud.split(":");
  switch (aud) {
    case 'User':
      return token(id, "User:", '/');
    case 'AccountUser':
      return token(id, "AccountUser:", '/');
  }
}

const loadResources = (payloade) => {
  let responseObject = { user: null, accountUser: null, account: null}
  let resourceRepo = null
  let underAccount = false
  let subscriptionPreference = null;
  return new Bluebird((resolve, reject) => {
    let [aud, id] = payloade.aud.split(":")

    if (aud == 'User') {
      resourceRepo = userReource;
    }else if (aud == 'AccountUser') {
      underAccount = true;
      resourceRepo = accountUserReource;
    }else{
      return(reject("User not Found"));
    }

    resourceRepo(id).then((user) => {
      if (user) {
        responseObject.user = _.pick(user.dataValues, ['id', 'email'])

        if(user.AccountUsers[0]){
          responseObject.accountUser = _.pick(user.AccountUsers[0].dataValues, ACCOUNT_USER_ATTRS)

          if(underAccount) {
            let account =  _.pick(user.AccountUsers[0].Account.dataValues, ACCOUNT_ATTRS)
            responseObject.account = account;
            
            if(!account.admin){
              let subscription = _.pick(user.AccountUsers[0].Account.Subscription.dataValues, ['active', 'planId'])
              responseObject.subscription = subscription
              subscriptionPreference = user.AccountUsers[0].Account.Subscription.SubscriptionPreference.data
            }
          }
        }

        if((responseObject.accountUser && responseObject.account)){
          perrmissions.forAccount(responseObject.account, responseObject.accountUser, subscriptionPreference).then((permissionsObject)=> {
            responseObject.perrmissions = permissionsObject
            resolve(responseObject);
          });
        }else{
          resolve(responseObject);
        }
          
      }else{
        reject("User not Found");
      }
    }, (error) => {
      reject(error);
    })
  });
}

const userReource = (id) => {
  return User.find({
    where: {id: id},
    attributes: ['id', 'email'],
    include: [{
      model: AccountUser, attributes: ACCOUNT_USER_ATTRS, 
      required: true,
      include: [{ model: Account, attributes: ACCOUNT_ATTRS}]
    }]
  })
}

const accountUserReource = (id) => {
  return User.find({
    attributes: ['id', 'email'],
    include: [{
      model: AccountUser,
      attributes: ACCOUNT_USER_ATTRS,
      required: true,
      include: [
        { model: Account, attributes: ACCOUNT_ATTRS,
          include: [{
              model: Subscription,
              include: [SubscriptionPreference]
            }]  
        }],
      where: {id: id}
    }]
  })
}

module.exports = {
  token: token,
  refresToken: refresToken,
  loadResources: loadResources,
}
