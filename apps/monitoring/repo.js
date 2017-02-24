"use strict";
const Channel = require('./channel');
const { EventEmitter } = require('events');
class Repo extends EventEmitter{
  constructor(adapterModule, url, options) {
    super()
    this.messageBuffer = [];
    this.url = url,
    this.options = options;
    this.adapterModule = adapterModule;
    this.channels = {};
    this.startAdapter();
    this.bindEvents();
  }
  bindEvents( ) {
      this.on("processMessage", () => {
          if(this.adapter.readyState === this.adapterModule.OPEN){
            let payload = this.messageBuffer.shift();

            if(payload){
                this.send(payload);
                this.emit("processMessage");
            }
          }
      });
  }
  startAdapter(){
    this.adapter = new this.adapterModule(this.url);
    this.subscribeAdapterEvents()
  }

  subscribeAdapterEvents(){
    this.adapter.on("message", (resp) => { 
        this._messageBroke(resp);
    });

    this.adapter.on('error', (err) => {
         setTimeout(() => {
            this.startAdapter();
         }, 2000);
    })

    this.adapter.on('close', (code) => {
        switch (code){
            case 1000:  // CLOSE_NORMAL
                console.log("WebSocket: closed");
                break;
            default:    // Abnormal closure
                setTimeout(() => {
                    this.startAdapter();
                }, 2000);
                break;
        }
        console.log('disconnected');
    });

    this.adapter.on("open", (resp) => {
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
            })

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