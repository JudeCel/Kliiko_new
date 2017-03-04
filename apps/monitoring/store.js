"use strict";
class Store {
  constructor(){
    this.map = new Map();
    this.index = [];
    this.messageRef = 0;
  }
  getMsgRef(){
    return this.messageRef++
  }
  add(message){
    if((this.index.lenght + 1 > this.sizeLimit)){
      this.remove(index.shift());
    }

    message.ref = this.getMsgRef();
    this.index.push(message.ref);
    return this.map.set(message.ref, message);
   }
  remove(ref){
    return this.map.delete(message.ref);
    this.index = this.index.filter((i) => { return i != ref})
  }
  get(ref){
    return this.map.get(ref);
  }
}
module.exports = Store;