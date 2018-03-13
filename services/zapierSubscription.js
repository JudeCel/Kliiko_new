'use strict';

let Bluebird = require('bluebird');
let { ZapierSubscription } = require('./../models');
let constants = require('../util/constants');
let filters = require('../models/filters');

function subscribe(event, targetUrl, accountId) {
  return new Bluebird((resolve, reject) => {
    ZapierSubscription.create({ event: event, targetUrl: targetUrl, accountId: accountId }).then((subscription) => {
      resolve({ id: subscription.id, event: subscription.event })
    }, (error) => {
      if(error.name == 'SequelizeValidationError') {
        reject(filters.errors(error));
      }
      
      reject();
    });
  });
}

function unsubscribe(id) {
  return new Bluebird((resolve, reject) => {
    findById(id).then((subscription) => {
      if(subscription) {
        subscription.destroy();
        resolve();
      }

      reject(constants.zapierSubscriptionNotFoundError);
    }, (error) => {
      reject(error);
    })
  });
}

function findById(id) {
  let where = {
    id: id
  };
  
  return new Bluebird((resolve, reject) => {
    ZapierSubscription.find({ where: where }).then((subscription) => {
      resolve(subscription);
    }, (error) => {
      reject(error);
    });
  });
}

function findAllByEvent(event) {
  let where = {
    event: event
  };
  
  return new Bluebird((resolve, reject) => {
    ZapierSubscription.findAll({ where: where }).then((subscriptions) => {
      resolve(subscriptions);
    }, (error) => {
      reject(error);
    });
  });
}

module.exports = {
  subscribe: subscribe,
  unsubscribe: unsubscribe,
  findAllByEvent: findAllByEvent
};