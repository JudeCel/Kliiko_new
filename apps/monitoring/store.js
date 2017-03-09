"use strict";
class Store {
  constructor(){
    this.map = new Map();
    this.index = [];
    this.messageRef = 0;
    this.bindCleanup();
    this.cleanUpInterval = 1
  }
  bindCleanup(){
    setInterval(() => {
      let dateNow = new Date();
      dateNow.setMinutes(dateNow.getMinutes() - this.cleanUpInterval);
       this.index = this.index.filter((m) => { return m.date > dateNow})
    }, 2000)
  }
  getMsgRef(){
    return this.messageRef++
  }
  add(message){
    message.ref = this.getMsgRef();
    this.index.push(message.ref);
    return this.map.set(message.ref, message);
   }
  remove(ref){
    return this.map.delete(ref);
    this.index = this.index.filter((i) => { return i != ref})
  }
  get(ref){
    return this.map.get(ref);
  }
}
module.exports = Store;