const EventEmitter = require('events');
class TransactionPool extends EventEmitter {
  constructor(name){
    super()
    this.tiket = 1;
    this.concurrentCount = 5;
    this.queue = [];
    this.activeQueue = [];
    this.events()
  }
  events(){
    this.on("nextTick", () => {
      console.log()
      if(this.activeQueue.length <= this.concurrentCount){
        this.startTransaction(this.queue.shift());
      }
    });

    this.on("endTransaction", (tiketNr) => {
      this.activeQueue = this.activeQueue.filter((i) => { return i != tiketNr});
      this.emit("nextTick");
    });
  }
  getTiket(){
    let tiket = this.tiket ++
    this.queue.push(tiket);
    return tiket;
  }

  startTransaction(tiketNr){
    if(tiketNr){
      this.activeQueue.push(tiketNr);
      this.emit(tiketNr);
    }
  }
}

module.exports = TransactionPool