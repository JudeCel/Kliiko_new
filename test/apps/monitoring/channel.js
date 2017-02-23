'use strict';
const { assert } = require('chai');
const { EventEmitter } = require('events');

const Channel = require('../../../apps/monitoring/channel');

describe('MONITORING - Channel', () => {
    it("can build new", (done) => {
        try {
            let channel = new Channel("name:1");
            done();
        } catch (error) {
            done(error);
        }
    });

    it("can join", (done) => {
        try {
            let channel = new Channel("name:1");
            let joinPayload = { topic: channel.topic, ref: 0, payload: {}, event: 'phx_join', state: 'sent' };

            channel.on("outgoingMessage", (payload) => {
                assert.deepEqual(payload, joinPayload);
                assert.isTrue(channel.isState('joining'));
                done();
            });
            
            channel.join();
        } catch (error) {
            done(error);
        }
    });

    it("can leave", (done) => {
        try {
            let channel = new Channel("name:1");
            channel.join();

            channel.on("outgoingMessage", (payload) => {
                let joinPayload = { topic: channel.topic, ref: 1, payload: {}, event: 'phx_leave', state: 'sent' };
                assert.deepEqual(payload, joinPayload);
                assert.isTrue(channel.isState('leaving'));
                done();
            });
            channel.leave();
        } catch (error) {
            done(error);
        }
    });

    it("can push message and listne event", (done) => {
        try {
            let channel = new Channel("name:1");
            channel.join();

            channel.on("outgoingMessage", (payload) => {
                let resp = {ref: payload.ref, event: "phx_reply", payload: {status: "ok"} }
                setInterval(() => {
                    channel.emit("incomingMessage", resp);
                })
            });

            let messageResp = channel.push("newEntry", {});
            messageResp.once("ok", (resp) => {
                done();
            })
        
        } catch (error) {
            done(error);
        }
    });

    it("can push message and listne promise", (done) => {
        try {
            let channel = new Channel("name:2");
            channel.join();

            channel.on("outgoingMessage", (payload) => {
                let resp = {ref: payload.ref, event: "phx_reply", payload: {status: "ok"} }
                setInterval(() => {
                    channel.emit("incomingMessage", resp);
                })
            });

            channel.push("newEntry", {}).getPromise().then((payload) => {
                done();
            }, done);
        } catch (error) {
            done(error);
        }
    });

    it("can lisen chanell", (done) => {
        try {
            let channel = new Channel("name:1");
            channel.join();

            channel.on("newEntry", (_payload) => {
                done();
            });

            let resp = {event: "newEntry", payload: {status: "ok", data: {}} }
            channel.emit("incomingMessage", resp);

        } catch (error) {
            done(error);
        }
    });
});