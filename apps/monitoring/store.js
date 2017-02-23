"use strict";
class Store {
  constructor(){
    this.map = new Map();
    this.index = [];
  }

  add(message){
    if((this.index.lenght + 1 > this.sizeLimit)){
      this.remove(index.shift());
    }
    
    this.index.push(message.ref);
    return this.map.set(message.ref, message);
   }
  remove(ref){
    this.index = this.index.filter((ref) => { return i != ref})
    return this.map.delete(message.ref);
  }
  get(ref){
    return this.map.get(ref);
  }
}
module.exports = Store;