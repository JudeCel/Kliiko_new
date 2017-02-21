"use strict";
const pm2 = require('pm2');

var monitoringPid = null;

pm2.connect((err, resp) => {
    if (err) {
        console.error(err);
        process.exit(2);
    }
    pm2.launchBus((err, bus) => {
        console.log('[PM2] Log streaming started');

        bus.on('log:out', (packet) => {
            console.log('[App:%s] %s', packet.process.name, packet.data);
        });

        // bus.on('log:err', (packet) => {
        //     console.error('[App:%s][Err] %s', packet.process.name, packet.data);
        // });

        bus.on('log:err', (packet) => {
            // console.error('[App:%s][Err] %s', packet.process.name, packet.data);
            // pm2.list((err, list) => {
            //     list.some((i) => { 
            //         if(i.name == 'monitoring'){
            //             monitoringPid = i.pm2_env.pm_id;
            //             return(false);
            //         }
            //         return(true);
            //     })

                pm2.sendDataToProcessId(monitoringPid, {
                    type: 'error',
                    topic : 'newEntry',
                    id: monitoringPid,
                    data : packet.data
                });
            });
        // });
    });

    pm2.start({
        "name": "monitoring",
        "script": "./apps/monitoring.js",
        "log_file": "./logs/monitoring/monitoring.log",
        "out_file": "./logs/monitoring/out.log",
        "error_file": "./logs/monitoring/err.log",
    }, (err, proc) => {});
    pm2.start({
        "name": "web",
        "script": "./apps/webServer.js",
        "log_file": "./logs/webServer/webServer.log",
        "out_file": "./logs/webServer/out.log",
        "error_file": "./logs/webServer/err.log",
        "exec_mode" : "cluster"
    }, (err, proc) => {
        monitoringPid = proc[0].pm2_env.pm_id
    });
    // pm2.start({
    //     "name": "backgroundSideServer",
    //     "script": "./apps/backgroundSideServer.js",
    //     "log_file": "./logs/backgroundSideServer/backgroundSideServer.log",
    //     "out_file": "./logs/backgroundSideServer/out.log",
    //     "error_file": "./logs/backgroundSideServer/err.log",
    //     "exec_mode" : "cluster"
    // }, (err, proc) => {
    // // Processing
    // });
});
