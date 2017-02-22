'use strict';
const { assert } = require('chai');
const { EventEmitter } = require('events');

const Repo = require('../../../apps/monitoring/repo');

class DummyAdapter extends  EventEmitter{
    constructor(){
        super();
    }
    send(data) {
        return data;
    }
}

describe('MONITORING - REPO', () => {
    it("can't build with invalid adapter", (done) => {
        let adapter = {};
        try {
            let repo = new Repo(adapter);
            done("Should not get here!!");
        } catch (_error) {
            done();
        }
    });

    it("can build with valid new", (done) => {
        let adapter = new DummyAdapter();

        try {
            let repo = new Repo(adapter);
            done();
        } catch (error) {
            done(error);
        }
    });


    it("can add channel ", (done) => {
        let adapter = new DummyAdapter();

        try {
            let repo = new Repo(adapter);
            repo.addChannel("channel:name1");
            assert.lengthOf(Object.keys(repo.channels), 1);
            done();
        } catch (error) {
            done(error);
        }
    });

    it("can't register a channel with an already registered name", (done) => {
        let adapter = new DummyAdapter();

        try {
            let repo = new Repo(adapter);
            repo.addChannel("channel:name1");
            repo.addChannel("channel:name1");
            done("Should not get here!!");
        } catch (error) {
            done();
        }
    });

    it("can join multiple channels ", (done) => {
        let adapter = new DummyAdapter();

        try {
            assert.equal(adapter._eventsCount, 0);
            let repo = new Repo(adapter);
            repo.addChannel("channel:name1");
            repo.addChannel("channel:name2");
            repo.joinChannels();
            assert.lengthOf(Object.keys(repo.channels), 2);
            done();

        } catch (error) {
            done(error);
        }
    });
});