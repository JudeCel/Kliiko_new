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
            assertIsFailedValidation('test', done);
        });

        it('should fail validation (variant 2)', (done) => {
            assertIsFailedValidation('TEST2', done);
        });
    });

    function assertIsFailedValidation(restricted, done) {
        notIn(restricted, (error) => {
            assert.equal(error, message);
            done();
        });
    }
});
