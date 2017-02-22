"use strict";
const Channel = require('./channel');
class Repo {
  constructor(adapter) {
    this.validateAdapter(adapter)
    this.adapter = adapter 
    this.channels = {};
    this.subscribeAdapterEvents();
  }

  validateAdapter(adapter){
    if(typeof adapter.on !== "function"){
        throw Error("Adapter should respond ro 'on' function");
    }
    if(typeof adapter.send !== "function"){
        throw Error("Adapter should respond on 'send' function");
    }
  }

  subscribeAdapterEvents(){
    this.adapter.on("message", (resp) => { 
        this._messageBroke(resp);
    });

    this.adapter.on('error', (err) => {
        console.log(err);
    })

    this.adapter.on('close', () => {
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
    return this.channels;
  }

  addChannel(name, joinPayload = {}){
        if(!this.channels[name]){
            let channel = new Channel(name, joinPayload);
            
            channel.on("outgoingMessage", (payload) => {
                this.adapter.send(JSON.stringify(payload));
            })

            this.channels[name]  = channel;
        }else{
            throw Error("Channel already exists with name: name");
        }
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