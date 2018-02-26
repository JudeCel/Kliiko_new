'use strict';

var models = require("../../models");

const drop_query = `DROP FUNCTION IF EXISTS table_update_notify;`
const query = `
  CREATE OR REPLACE FUNCTION table_update_notify() RETURNS trigger AS $$
    DECLARE
      id bigint;
      data jsonb;
    BEGIN

    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
      data = row_to_json(NEW);
    ELSE
      data = row_to_json(OLD);
    END IF;

    PERFORM pg_notify('table_update', json_build_object('table', TG_TABLE_NAME, 'data', data, 'type', TG_OP)::text);

    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;`


function createTableChangeNotify() {
  return models.sequelize.query(query);
}

function removeTableChangeNotify() {
  return models.sequelize.query(drop_query);
}

function ifFunctionExists(functionName) {
  const findFunctionQuery = `select pg_get_functiondef('${functionName}()'::regprocedure);`
  return models.sequelize.query(findFunctionQuery);
}

module.exports = {
  createTableChangeNotify: createTableChangeNotify,
  removeTableChangeNotify: removeTableChangeNotify,
  ifFunctionExists: ifFunctionExists
}
