'use strict';

var {assert} = require('chai');
const util = require('util');
var TransactionPool = require('./../../lib/transactionPool');


describe("TransactionPool", () => {
    describe('#init with options', () => {
        it('default options', () => {
            let transactionPool = new TransactionPool();
            assert.equal(transactionPool.concurrentCount, 5);
            assert.equal(transactionPool.timeout, 10000);
            assert.equal(transactionPool.tiket, 1);
        });

        it('can give options', () => {
            let options = {concurrentCount: 20, timeout: 12};
            let transactionPool = new TransactionPool(options);
            assert.equal(transactionPool.concurrentCount, options.concurrentCount);
            assert.equal(transactionPool.timeout, options.timeout);
        });
    });

    describe('get tiket', () => {
        it('increment', () => {
            let transactionPool = new TransactionPool();
            let startNumber = transactionPool.tiket;
            let poolTikets = 10;
            for (let index = startNumber; index <= [...Array(poolTikets).keys()].length; index++) {
                transactionPool.getTiket();       
            }
            assert.equal(startNumber + poolTikets,  transactionPool.tiket);
        });
    });

    describe('listnes pool', () => {
        it('full standart flow', (done) => {
            let transactionPool = new TransactionPool();
            let tiketNr = transactionPool.getTiket();  
            
            transactionPool.once(tiketNr, () => {
                transactionPool.emit(transactionPool.CONSTANTS.endTransaction, tiketNr);
                try {
                    assert.lengthOf(transactionPool.queue, 0)
                    assert.lengthOf(transactionPool.activeQueue, 0)
                    done();
                } catch (error) {
                    done(error);
                }
            });

            transactionPool.emit(transactionPool.CONSTANTS.nextTick);
        });

        it('Timeout flow', (done) => {
            let transactionPool = new TransactionPool({timeout: 1});
            let tiketNr = transactionPool.getTiket();  

            transactionPool.once(transactionPool.timeoutEvent(tiketNr), () => {
                done();
            });

            transactionPool.emit(transactionPool.CONSTANTS.nextTick);
        });
    });
})