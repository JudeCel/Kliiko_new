'use strict';
let Bluebird = require('bluebird');
const drop_query = `DROP FUNCTION IF EXISTS table_update_notify;`
const query = `
  CREATE OR REPLACE FUNCTION table_update_notify() RETURNS trigger AS $$
      DECLARE
        id bigint;
      BEGIN
        IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
          id = NEW.id;
        ELSE
          id = OLD.id;
        END IF;

        PERFORM pg_notify('table_update', json_build_object('table', TG_TABLE_NAME, 'id', id, 'type', TG_OP)::text);

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;`
module.exports = {
  up: function (queryInterface, Sequelize) {
    return new Bluebird(function (resolve, reject) {
      queryInterface.sequelize.query(query).then(function(result) {
        resolve();
      }, function(error) {
        reject(error);
      });
    });
  },
  down: function (queryInterface, Sequelize) {
    return new Bluebird(function (resolve, reject) {
      queryInterface.sequelize.query(drop_query).then(function(result) {
        resolve();
        }, function(error) {
        reject(error);
      });
    });
  }
}
