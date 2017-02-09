"use strict";

let assert = require('assert');
let validation  = require('./../../../models/validations');

describe('not in validation (lower case)', () => {
    let restrictedStrings = ['test', 'test2'];
    let message = 'Value is restricted!';
    let notIn = validation.notInLower(restrictedStrings, message);

    describe('string is not in restricted values', () =>  {
        it('should pass validation', (done) => {
            notIn('test1', (error) => {
                assert.equal(error, undefined);
                done();
            });
        });
    });;

    describe('string is in restricted values', () => {
        it('should fail validation (variant 1)', (done) => {
            notIn('test', (error) => {
                assert.equal(error, message);
                done();
            });
        });

        it('should fail validation (variant 2)', (done) => {
            notIn('TEST2', (error) => {
                assert.equal(error, message);
                done();
            });
        });
    });
});
