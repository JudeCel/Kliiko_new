"use strict";
/**
 * Module dependencies.
 */
 require('dotenv-extended').load({
     errorOnMissing: true
 });

var express = require('express');
var app = require('../app');
var debug = require('debug')('kliiko:server');
var http = require('http');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.SERVER_PORT);
var environment = process.env.NODE_ENV;
app.set('port', port);



switch (environment) {
  case 'build':
    console.log('** BUILD **');
    app.use(express.static('./build/'));
    app.use('/*', express.static('./build/index.html'));
    break;
  default:
    app.use(express.static('./src/client/'));
    app.use(express.static('./'));
    app.use(express.static('./tmp'));
    app.use('/*', express.static('./src/client/index.html'));
    break;
}

/**
 * Create HTTP server.
 */
 // if (cluster.isMaster && app.get('env') != "development") {
 //   console.log(`Cluster count: ${numCPUs}`);
 //  // Fork workers.
 //  for (var i = 0; i < numCPUs; i++) {
 //    cluster.fork();
 //  }
 //
 //  cluster.on('exit', (worker, code, signal) => {
 //    console.log(`worker ${worker.process.pid} died`);
 //  });
// } else {
  // Workers can share any TCP connection
  // In this case it is an HTTP server
  var server = http.createServer(app);
  /**
  * Listen on provided port, on all network interfaces.
  */
  server.listen(port);
  server.on('error', onError);
  server.on('listening', onListening);

 // server.maxConnections = 20;

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
