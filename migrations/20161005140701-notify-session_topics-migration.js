'use strict';
let Bluebird = require('bluebird');

const drop_if_exists_query = `DROP TRIGGER IF EXISTS session_topic_notify ON "SessionTopics";`
const create_trigger_query = `CREATE TRIGGER session_topic_notify  AFTER INSERT OR UPDATE OR DELETE ON "SessionTopics" FOR EACH ROW EXECUTE PROCEDURE table_update_notify();`

module.exports = {
  up: function (queryInterface, Sequelize) {
    return new Bluebird(function (resolve, reject) {
      queryInterface.sequelize.query(drop_if_exists_query).then(function() {
        queryInterface.sequelize.query(create_trigger_query).then(function() {
          resolve();
        }, function(error) {
          reject(error);
        })
      }, function(error) {
        reject(error);
    })
  })
  },

  down: function (queryInterface, Sequelize) {
    return new Bluebird(function (resolve, reject) {
      queryInterface.sequelize.query(drop_if_exists_query).then(function() {
        resolve();
      }, function(error) {
        reject(error);
      });
    })
  }
};
