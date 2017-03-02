const { EventEmitter2 } = require('eventemitter2');

class Message extends EventEmitter2 {
  constructor(topic, payload, event, ref){
    super({verboseMemoryLeak: true});
    this.ref = ref;
    this.topic = topic;
    this.payload = payload;
    this.promise = new Promise(this._defPromise());
    this.event = event;
    this.state =  'build'
    this.bindPromise
  }
  _defPromise(){
    return (resolve, reject) => {
      this.on("resolve", (payload) => {
        resolve(payload);
      });

      this.on("reject", (payload) => {
        reject(payload);
      });
    }
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
    return this.promise;
  }
  setSent(){
    this.state = 'sent'
  }
  processReply(staus, reply){
    this.emit(staus, reply.payload);
    this.emit(reply.payload.status, reply.payload);
  }
}

module.exports = Message;