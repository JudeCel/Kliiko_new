// var config = require('simpler-config').load(require('../config/config.json'));
// var mysql = require('mysql');
//
// var db = mysql.createConnection({
// 	user: config.mysql.user,
// 	password: config.mysql.password,
// 	database: config.mysql.database
// });
//
// function dbHandleDisconnect() {
// 	db.on('error', function (error) {
// 		if (!error.fatal) return;
// 		if (error.code !== 'PROTOCOL_CONNECTION_LOST') throw err;
//
// 		console.error('> Re-connecting lost MySQL connection: ' + error.stack);
//
// 		// NOTE: This assignment is to a variable from an outer scope; this is extremely important
// 		// If this said `client =` it wouldn't do what you want. The assignment here is implicitly changed
// 		// to `global.mysqlClient =` in node.
// 		db = mysql.createConnection(client.config);
// 		dbHandleDisconnect();
// 		db.connect();
// 	});
// };
//
// module.exports.dbHandleDisconnect = dbHandleDisconnect;
