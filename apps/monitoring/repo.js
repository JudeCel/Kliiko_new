"use strict";
const Channel = require('./channel');
const url = require('url');
const { EventEmitter2 } = require('eventemitter2');

const REPO_STATES = {
  build: 'build',
  connecting: 'connecting',
  open: 'open',
  closed: 'closed',
  reconnecting: 'reconnecting'
}

class Repo extends EventEmitter2 {
  constructor(wsModule, url, connectionOptions) {
    super({verboseMemoryLeak: true});
    this.messageBuffer = [];
    this.connectionOptions = connectionOptions;
    this.url = url,
    this.adapter = null;
    this.state = REPO_STATES.build;
    this.wsModule = wsModule;
    this.channels = {};
    this.bindEvents();
  }
  changeState(to){
    let from = this.state;
    let _to = REPO_STATES[to];
    this.state = _to;

    this.emit("stateChange", {from, to: _to});
    this.emit(to);
  }

  connect(){
    this.startAdapter();
    this.changeState('connecting');
  }
  bindEvents() {
    this.on("processMessage", () => {
      if(this.state == REPO_STATES.open){
        let payload = this.messageBuffer.shift();

        if(payload){
          this.send(payload);
          this.emit("processMessage");
        }
       }
    });
  }
  startAdapter(){
    if(this.adapter){
      ["message", "error","close","open"].forEach((listener) =>{
        this.adapter.removeAllListeners(listener);
      });
    }

    let urlObject = url.parse(this.url)
    urlObject.query = this.connectionOptions
    this.adapter = new this.wsModule(urlObject.format());
    this.subscribeAdapterEvents();
  }

  closeAllChannel(){
    Object.keys(this.channels).forEach((channel) =>{
      this.channels[channel].changeState("closed");
    });
  }

  reconnecting(){
    this.changeState("reconnecting");
    this.closeAllChannel();
    setTimeout(() => {
      this.startAdapter();
    }, 2000);
  }
  subscribeAdapterEvents(){
    this.adapter.on("message", (resp) => {
      this._messageBroke(resp);
    });

    this.adapter.on('error', (err) => {
      this.reconnecting();
    });

    this.adapter.on('close', (code) => {
      switch (code){
        case 1000:  // CLOSE_NORMAL
          this.closeAllChannel();
          console.log("WebSocket: closed");
          break;
        default:    // Abnormal closure
          this.reconnecting();
          break;
      }
    });

    this.adapter.on("open", (resp) => {
      this.changeState("open");
      this.joinChannels();
    });
  }

  joinChannels(){
    Object.keys(this.channels).forEach((item) => {
      let channel = this.channels[item];
      channel.join();
    });

    this.emit("processMessage");
    return this.channels;
  }

  addChannel(name, joinPayload = {}){
    if(!this.channels[name]){
      let channel = new Channel(name, joinPayload);

      channel.on("outgoingMessage", (payload) => {
        this.messageBuffer.push(payload);
        this.emit("processMessage");
      });

      this.channels[name]  = channel;
      return channel;
    }else{
        throw Error("Channel already exists with name: name");
    }
  }
  send(payload){
    this.adapter.send(JSON.stringify(payload));
  }
  _messageBroke(messageString) {
    let message = JSON.parse(messageString);
    let channel = this.channels[message.topic];

    if(channel){
      channel.emit('incomingMessage', message);
    }else{
      console.warn("Channel not found: ", message.topic)
      console.log(message);
    }
  }
}

module.exports = Repo