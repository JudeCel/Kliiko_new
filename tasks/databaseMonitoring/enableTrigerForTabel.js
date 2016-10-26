'use strict';
var models = require("../../models");

const remove = (triggerName, tableName) => {
  return models.sequelize.query(dropIfExistsQuery(triggerName, tableName));
}

const create = (triggerName, tableName) => {
  return remove(triggerName, tableName).then(function(result) {
    return models.sequelize.query(createTriggerQuery(triggerName, tableName));
  });
}

function dropIfExistsQuery(triggerName, tableName) {
  return `DROP TRIGGER IF EXISTS ${triggerName} ON "${tableName}";`
}
function createTriggerQuery(triggerName, tableName) {
  return `CREATE TRIGGER ${triggerName}  AFTER INSERT OR UPDATE OR DELETE ON "${tableName}" FOR EACH ROW EXECUTE PROCEDURE table_update_notify();`
}

module.exports = {
  create: create,
  remove: remove
}
