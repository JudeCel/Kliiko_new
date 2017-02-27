const EventEmitter = require('events');
const util = require('util');

const CONSTANTS = {
  nextTick: "nextTick",
  endTransaction: "endTransaction",
  transactionBind: "transactionBind"
}
class TransactionPool extends EventEmitter {
  constructor(options={}){
    super()
    this.CONSTANTS = CONSTANTS;
    this.tiket = 1;
    this.concurrentCount = (options.concurrentCount || 5);
    this.timeout = (options.timeout || 10000);
    this.queue = [];
    this.activeQueue = [];
    this.events()
  }
  events(){
    this.on(this.CONSTANTS.nextTick, () => {
      if(this.activeQueue.length <= this.concurrentCount){
        let nextTiket = this.queue.shift();
        this.startTransaction(nextTiket);
      }
    });

    this.on(this.CONSTANTS.endTransaction, (tiketNr) => {
      this.activeQueue = this.activeQueue.filter((i) => { return i != tiketNr});
      this.removeAllListeners(tiketNr);
      this.removeAllListeners(this.timeoutEvent(tiketNr));
      this.emit(this.CONSTANTS.nextTick);
    });
  }
  timeoutEvent(tiket){
    return `${tiket}:timeout`
  }
  bindTimeout(tiketNr){
    setTimeout(() => {
      this.emit(this.timeoutEvent(tiketNr));
      this.emit(this.CONSTANTS.endTransaction, tiketNr);
    }, this.timeout);
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
      this.bindTimeout(tiketNr);
    }
  }
}

module.exports = TransactionPool;