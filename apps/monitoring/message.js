const { EventEmitter } = require('events');
class Message extends EventEmitter {
  constructor(topic, payload, event, ref){
    super()
    this.ref = ref;
    this.topic = topic;
    this.payload = payload;
    this.defer = Promise.defer();
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
    return this.defer.promise
  }
  setSent(){
    this.state = 'sent'
  }
}

module.exports = Message;