module.exports = {
  apps : [{
    "name": "web",
    "script": "./apps/webServer.js",
    "log_file": "./logs/webServer/webServer.log",
    "out_file": "./logs/webServer/out.log",
    "error_file": "./logs/webServer/err.log",
    "exec_mode" : "cluster"
  },{
    "name": "backgroundSideServer",
    "script": "./apps/backgroundSideServer.js",
    "log_file": "./logs/backgroundSideServer/backgroundSideServer.log",
    "out_file": "./logs/backgroundSideServer/out.log",
    "error_file": "./logs/backgroundSideServer/err.log",
    "exec_mode" : "cluster"
  }]
}
