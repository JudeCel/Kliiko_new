'use strict';

var models = require("../../models");

const drop_query = `DROP FUNCTION IF EXISTS table_update_notify;`
const query = `
  CREATE OR REPLACE FUNCTION table_update_notify() RETURNS trigger AS $$
    DECLARE
      id bigint;
      session_id bigint DEFAULT null;
    BEGIN

      IF quote_ident(TG_TABLE_NAME) = '"SessionTopics"' THEN
        IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
          id = NEW.id;
          session_id = NEW."sessionId";
        ELSE
          id = OLD.id;
          session_id = OLD."sessionId";
        END IF;
      END IF;

      IF quote_ident(TG_TABLE_NAME) = '"Sessions"' THEN
        IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
          id = NEW.id;
          session_id = NEW.id;
        ELSE
          id = OLD.id;
          session_id = OLD.id;
        END IF;
      END IF;

      PERFORM pg_notify('table_update', json_build_object('table', TG_TABLE_NAME, 'id', id, 'session_id', session_id, 'type', TG_OP)::text);

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
