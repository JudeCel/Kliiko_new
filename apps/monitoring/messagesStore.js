"use strict";
class MessagesStore {
  constructor(options = {}){
    this.map = { };
    this.sizeLimit = options.sizeLimit || 100;
    this.index = [];
  }

  add(message){
    if((this.index.lenght + 1 > this.sizeLimit)){
      this.remove(index.shift());
    }
    
    this.index.push(message.ref);
    return this.map[message.ref] =  message;
   }
  remove(ref){
    this.index = this.index.filter((ref) => { return i != ref})
    return delete this.map[ref];
  }
  get(ref){
    return this.map[ref];
  }
}
module.exports = MessagesStore;