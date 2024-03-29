
"use strict";
const { EventEmitter2 } = require('eventemitter2');
const Store = require('./store');
const Message = require('./message');

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

class Channel extends EventEmitter2 {
    constructor(name, options){
      super({verboseMemoryLeak: true});
      this.topic =  name;
      this.options = options || {};
      this.state =  CHANNEL_STATES.set;
      this.messages =  new Store();
      this.on('incomingMessage', (message) => { this.incomingMessage(message)});
      this.on('closed', (message) => { 
        this.clearStore();
      });
    }
    push(event, payload){
      if(this.state != CHANNEL_STATES.closed){
        let message = this.buildMessage(payload, event);
        message.setSent();
        this.emit("outgoingMessage", message.toParams());
        return message;
      }
    }
    clearStore(){
      this.messages =  new Store();
    }
    changeState(to){
      let from = this.state;
      let _to = CHANNEL_STATES[to];
      this.state = _to;

      this.emit("stateChange", {from, to: _to});
      this.emit(to);
    }

    join(){
      if(this.canJoin()){
        let message = this.buildMessage(this.options, CHANNEL_EVENTS.join);
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
        message.setSent();
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
      let message = new Message(this.topic, payload, event);
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
          this.replyError(eventMessage, message);
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
          this.resolveMessage(message, reply);
        }
      }else{
        this.changeState('errored');
        this.rejectMessage(message, reply);
      }
    }
    incomingError(message, reply){
      this.changeState('errored');
      this.rejectMessage(message, reply)
    }
    replyError(message, reply){
      this.rejectMessage(message, reply)
    }
    incomingReply(message, reply){
      this.resolveMessage(message, reply);
    }
    incomingClose(message, reply){
      this.clearStore();
      this.changeState('closed');
      this.resolveMessage(message, reply)
    }
    incomingLeave(message, reply){
      this.clearStore();
      this.changeState('closed');
      this.resolveMessage(message, reply);
    }

    resolveMessage(message, reply){
      message.processReply('resolve', reply);
    }
    rejectMessage(message, reply){
      message.processReply('reject', reply);
    }
}

module.exports = Channel;