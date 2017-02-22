"use strict";
const { EventEmitter } = require('events');
const MessagesStore = require('./messagesStore');

class Message extends EventEmitter {
  constructor(topic, payload, event, ref){
    super()
    
    this.ref = ref;
    this.topic = topic
    this.payload = payload
    this.event = event;
    this.state =  'build'
    this.on("processMsg", (message) => {this.processMessage(message)})
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
  processMessage(message) {
    this.emit("ok", {});
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
      message.state = 'sent'
      this.emit("outgoingMessage", message.toParams());
      return message;
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
        message.state = 'sent'
        this.emit("outgoingMessage", message.toParams());
      }
      return this;
    }

    leave(){
      if(this.canLeave()){
        let message = this.buildMessage({}, CHANNEL_EVENTS.leave);
        this.changeState('leaving');
        message.state = 'sent'
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
        if(eventMessage) {
          eventMessage.emit("processMsg", message)
        }
        switch (message.event) {
          case CHANNEL_EVENTS.join:
            this.incomingJoin(eventMessage, message);
            break;
          case CHANNEL_EVENTS.error:
            this.replyError(messeventMessage, messageage);
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
            console.warn("Message not found:", eventMessage);
            break;
        }
    }

    incomingJoin(message, reply){
      if (message.payload.status == "ok") {
        this.changeState('joined');
      }else{
        this.changeState('errored');
      }
    }
    incomingError(message, reply){
      this.changeState('errored');
    }
    incomingReply(message, reply){
      // console.log(message)
      // // message.emit("ok", {});
    }
    incomingClose(message, reply){
      this.changeState('closed'); 
    }
    incomingLeave(message, reply){ 
      this.changeState('closed');
    }
}

module.exports = Channel;