"use strict";
const stackTrace = require('stack-trace');
const os = require('os');

const getApplication = () => {
  return process.env.APPLICATION_NAME;
}

const getStack = (err) => {
  return (err.stack && err.stack.split('\n'))
}

const parse = (error) => {
 try {
     return JSON.parse(error);
 } catch (err) {
    return getAllInfo(new Error(error));
 }
}

const  getAllInfo =  (err) => {
  const stack = getStack(err);
  return {
    application: getApplication(),
    date:    new Date().toString(),
    process: getProcessInfo(),
    os:      getOsInfo(),
    trace:   getTrace(err),
    level:   'error',
    currentResources: {},
    stack:   stack,
    message: stack[1]
  };
};

const getProcessInfo =  () => {
  return {
    pid:         process.pid,
    uid:         process.getuid ? process.getuid() : null,
    gid:         process.getgid ? process.getgid() : null,
    cwd:         process.cwd(),
    execPath:    process.execPath,
    version:     process.version,
    argv:        process.argv,
    memoryUsage: process.memoryUsage()
  };
};

const getOsInfo =  () => {
  return {
    loadavg: os.loadavg(),
    uptime:  os.uptime()
  };
};

const getTrace = (err) => {
  var trace = err ? stackTrace.parse(err) : stackTrace.get();
  return trace.map( (site) => {
    return {
      column:   site.getColumnNumber(),
      file:     site.getFileName(),
      function: site.getFunctionName(),
      line:     site.getLineNumber(),
      method:   site.getMethodName(),
      native:   site.isNative(),
    }
  });
};

module.exports = {
  parse: parse
};