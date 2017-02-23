"use strict";
const { EventEmitter } = require('events');
const MessagesStore = require('./messagesStore');

class Message extends EventEmitter {
  constructor(topic, payload, event, ref){
    super()
    this.ref = ref;
    this.topic = topic;
    this.payload = payload;
    this.promise = Promise.defer();
    this.event = event;
    this.state =  'build'
  }
  toParams(){
    return {
      topic: this.topic,
      ref: this.ref,
      payload: this.payload,
      event: this.event,
      state: this.state
    }
  }
  getPromise(){
    return this.promise.promise
  }
  setSent(){
    this.state = 'sent'
  }
}

const CHANNEL_EVENTS = {
  close: "phx_close",
  error: "phx_error",
  join: "phx_join",
  reply: "phx_reply",
  leave: "phx_leave"
};

const CHANNEL_STATES = {
  set: "set",
  closed: "closed",
  errored: "errored",
  joined: "joined",
  joining: "joining",
  leaving: "leaving"
}

class Channel extends EventEmitter {
    constructor(name){
      super();
      this.ref = 0;
      this.topic =  name;
      this.state =  CHANNEL_STATES.set;
      this.messages =  new MessagesStore();
      this.on('incomingMessage', (message) => { this.incomingMessage(message)});
    }
    push(event, payload){
      let message = this.buildMessage(payload, event);
      message.setSent();
      this.emit("outgoingMessage", message.toParams());
      return message.getPromise();
    }
    getMsgRef(){ 
      return this.ref ++ 
    }

    changeState(to){
      let from = this.state;
      let _to = CHANNEL_STATES[to];
      this.state = _to;

      this.emit("stateChange", {from, to: _to});
      this.emit(to, {});
    }

    join(){
      if(this.canJoin()){
        let message = this.buildMessage({}, CHANNEL_EVENTS.join);
        this.changeState('joining');
        message.setSent();
        this.emit("outgoingMessage", message.toParams());
      }
      return this;
    }

    leave(){
      if(this.canLeave()){
        let message = this.buildMessage({}, CHANNEL_EVENTS.leave);
        this.changeState('leaving');
        message.setSent()
        this.emit("outgoingMessage", message.toParams());
      }
      return this;
    }

    canLeave(){ 
      return(this.isState('joining') || this.isState('joined'))
    }

    canJoin(){
      return(!this.isState('joining') || !this.isState('joined')) 
    }

    isState(key){
      return(this.state == CHANNEL_STATES[key])
    }

    buildMessage(payload, event){
      let message = new Message(this.topic, payload, event, this.getMsgRef());
      this.messages.add(message);
      return message;
    }

    incomingMessage(message){
        let eventMessage = this.messages.get(message.ref);
        
        switch (message.event) {
          case CHANNEL_EVENTS.join:
            this.incomingJoin(eventMessage, message);
            break;
          case CHANNEL_EVENTS.error:
            this.replyError(eventMessage, messageage);
            break;
          case CHANNEL_EVENTS.reply:
            this.incomingReply(eventMessage, message);
            break;
          case CHANNEL_EVENTS.close:
            this.incomingClose(eventMessage, message);
            break;
          case CHANNEL_EVENTS.leave:
            this.incomingLeave(eventMessage, message);
            break;
          default:
            this.emit(message.event, message.payload);
            break;
        }
    }

    incomingJoin(message, reply){
      if (reply.payload.status == "ok") {
        this.changeState('joined');
        if(message){
          message.promise.resolve(reply.payload);
        }
      }else{
        this.changeState('errored');
        if(message){ message.promise.reject(reply.payload) }
      }
    }
    incomingError(message, reply){
      this.changeState('errored');
      if(message){ message.promise.reject(reply.payload)}
    }
    incomingReply(message, reply){
      if(message){ message.promise.resolve(reply.payload)}
    }
    incomingClose(message, reply){
      this.changeState('closed');
      if(message){ message.promise.resolve(reply.payload)}
    }
    incomingLeave(message, reply){ 
      this.changeState('closed');
     if(message){ message.promise.resolve(reply.payload) }
    }
}

module.exports = Channel;