'use strict';
const { assert } = require('chai');
const { EventEmitter2 } = require('eventemitter2');

const Repo = require('../../../apps/monitoring/repo');


class DummyAdapter extends  EventEmitter2{
    constructor(url, options){
      super();
    }
    send(data) {
      return data;
    }
}

describe('MONITORING - REPO', () => {
  describe("build", () => {
    it("can build with valid new", (done) => {
      try {
        let repo = new Repo(DummyAdapter, "pff");
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  describe("join channel", () => {
    it("can add channel ", (done) => {
      try {
        let repo = new Repo(DummyAdapter, "pff");
        repo.addChannel("channel:name1");
        assert.lengthOf(Object.keys(repo.channels), 1);
        done();
      } catch (error) {
        done(error);
      }
    });

    it("can't register a channel with an already registered name", (done) => {
      try {
        let repo = new Repo(DummyAdapter, "pff");
        repo.addChannel("channel:name1");
        repo.addChannel("channel:name1");
        done("Should not get here!!");
      } catch (error) {
        done();
      }
    });

    it("can join multiple channels ", (done) => {
      try {
        let repo = new Repo(DummyAdapter, "pff");
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

  describe("connection", () => {
    class DummyConnectingAdapter extends  EventEmitter2{
      constructor(url, options){
        super();
      }
      send(data) {
        return data;
      }
    }

    it("can connect", (done) => {
      let repo = new Repo(DummyConnectingAdapter, "pff");
      repo.on("open", () => {
        done();
      });

      repo.connect();
      repo.adapter.emit("open");
    });

    it("can connect reconnect", (done) => {
      let repo = new Repo(DummyConnectingAdapter, "pff");
      repo.once("open", () => {});
      repo.once("close", () => {});
      repo.once("reconnecting", () => {
        repo.once("open", () => {
          done();
        });
        repo.adapter.emit("open");
      });

      repo.connect();
      repo.adapter.emit("open");
      repo.adapter.emit("close");
    });
  })
});