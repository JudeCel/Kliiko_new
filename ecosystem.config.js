module.exports = {
  apps : [{
    "name": "web",
    "script": "./apps/webServer.js",
    "watch": true,
    "log_file": "./logs/webServer/webServer.log",
    "out_file": "./logs/webServer/out.log",
    "error_file": "./logs/webServer/err.log",
    env: {
      "NODE_ENV": "development",
      instances: 1
    },
    env_production : {
      "NODE_ENV": "production",
      instances: 2
    }
  },{
    "name": "backgroundSideServer",
    "script": "./apps/backgroundSideServer.js",
    "watch": true,
    "log_file": "./logs/backgroundSideServer/backgroundSideServer.log",
    "out_file": "./logs/backgroundSideServer/out.log",
    "error_file": "./logs/backgroundSideServer/err.log",
    env: {
      "NODE_ENV": "development",
      "instances": 1
    },
    env_production : {
      "NODE_ENV": "production",
      "instances": 2
    }
  }]
}
