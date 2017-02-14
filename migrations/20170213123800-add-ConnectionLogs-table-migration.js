'use strict';
 let Bluebird = require('bluebird');
 let validateError = require('./helpers/errorFilter.js').validateError

 module.exports = {
   up: (queryInterface, Sequelize) => {
     return new Bluebird((resolve, reject) => {
        queryInterface.createTable('ConnectionLogs', {
            id: {
              type: Sequelize.INTEGER,
              primaryKey: true,
              autoIncrement: true
            },
            userId: {
              type: Sequelize.INTEGER,
              allowNull: true,
            },
            accountUserId: {
              type: Sequelize.INTEGER,
              allowNull: true,
            },
            accountId: {
              type: Sequelize.INTEGER,
              allowNull: true
            },
            responseTime: {
              type: Sequelize.INTEGER,
              allowNull: false
            },
            level: {
              type: Sequelize.STRING,
              allowNull: false
            },
            application: {
              type: Sequelize.STRING,
              allowNull: false
            },
            meta: {
              type: Sequelize.JSONB,
              allowNull: true,
              defaultValue: {}
            },
            req: {
              type: Sequelize.JSONB,
              allowNull: true,
              defaultValue: {}
            },
            res: {
              type: Sequelize.JSONB,
              allowNull: true,
              defaultValue: {}
            },
            createdAt: Sequelize.DATE
          }
        ).then(() => {
          queryInterface.addIndex('ConnectionLogs', ['userId', 'accountUserId', 'accountId', 'level']).then(() => {
            resolve();
          }, (error) => {
            validateError(error, resolve, reject);
          })
        }, (error) => {
           validateError(error, resolve, reject);
        });
    });
   },
   down: (queryInterface, Sequelize) => {
     return queryInterface.dropTable('ConnectionLogs');
   }
 };