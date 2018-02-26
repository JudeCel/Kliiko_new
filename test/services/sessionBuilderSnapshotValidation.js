'use strict';

var assert = require('chai').assert;
var constants = require('../../util/constants');
var sessionBuilderSnapshotValidation = require('./../../services/sessionBuilderSnapshotValidation');
var sessionBuilderService = require('./../../services/sessionBuilder');
var stringHelpers = require('./../../util/stringHelpers');

describe('SERVICE - SessionBuilderSnapshotValidation', function() {
  describe('validate', function(done) {
    let data = {
      name: "test"
    } 
    const params = {
      name: "test1"
    }   
    const validSnapshot = {
      name: stringHelpers.hash(data.name)
    }
    const invalidSnapshot = {
      name: 123
    };

    describe('#isDataValid', function(done) {   
      it('should be valid', function(done) {
        let res = sessionBuilderSnapshotValidation.isDataValid(validSnapshot, params, data);
        assert.isTrue(res.isValid);
        done();
      });
      it('should be not valid', function(done) {
        let res = sessionBuilderSnapshotValidation.isDataValid(invalidSnapshot, params, data);
        assert.isFalse(res.isValid);
        assert.isTrue(res.canChange);
        done();
      });
    });

    describe('#isFacilitatorDataValid', function(done) {
      it('should be valid', function(done) {
        let snapshot = {
          facilitatorId: stringHelpers.hash(null)
        };
        sessionBuilderSnapshotValidation.isFacilitatorDataValid(snapshot, 1, 1, sessionBuilderService).then(function(validationRes) {
          assert.isTrue(validationRes.isValid);
          done();
        }, function (error) {
          done(error);
        });
      });
      it('should be not valid', function(done) {
        let snapshot = {
          facilitatorId: stringHelpers.hash(102)
        };
        sessionBuilderSnapshotValidation.isFacilitatorDataValid(snapshot, 101, 1, sessionBuilderService).then(function(validationRes) {
          assert.isFalse(validationRes.isValid);
          assert.isTrue(validationRes.canChange);
          done();
        }, function (error) {
          done(error);
        });
      });
    });

    describe('#isTopicDataValid', function(done) {
      it('should be valid', function(done) {
        let snapshot = {
          1: validSnapshot
        };
        data.topicId = 1;
        let res = sessionBuilderSnapshotValidation.isTopicDataValid(snapshot, params, data);
        assert.isTrue(res.isValid);
        done();
      });
      it('should be not valid', function(done) {
        let snapshot = {
          1: invalidSnapshot
        };
        data.topicId = 1;
        let res = sessionBuilderSnapshotValidation.isTopicDataValid(snapshot, params, data);
        assert.isFalse(res.isValid);
        assert.isTrue(res.canChange);
        done();
      });
    });
    
    describe('#isMailTemplateDataValid', function(done) { 
      const templateParams = {
        template: {
          content: "test1",
          subject: "test2"
        }
      }  
      const mailTempplate = {
        content: "testContent",
        subject: "testSubject"
      }

      it('should be valid', function(done) {
        let snapshot = {
          content: stringHelpers.hash(mailTempplate.content),
          subject: stringHelpers.hash(mailTempplate.subject)
        };
        let res = sessionBuilderSnapshotValidation.isMailTemplateDataValid(snapshot, templateParams, mailTempplate);
        assert.isTrue(res.isValid);
        done();
      });
      it('should be not valid', function(done) {
        let snapshot = {
          content: 123,
          subject: 123
        };
        let res = sessionBuilderSnapshotValidation.isMailTemplateDataValid(snapshot, templateParams, mailTempplate);
        assert.isFalse(res.isValid);
        assert.isTrue(res.canChange);
        done();
      });
    });
  });

  describe('get snapshot', function(done) {
    it('#getSessionSnapshot', function(done) {
      let session = {
        id: 1,
        name: "test",
        startTime: new Date(),
        endTime: new Date(),
        timeZone: 'Europe/Riga',
        type: 'focus',
        anonymous: true
      }
      let res = sessionBuilderSnapshotValidation.getSessionSnapshot(session);
      let fields = constants.sessionBuilderValidateChanges.session.changableFields.concat(constants.sessionBuilderValidateChanges.session.notChangableFields);
      for (let i=0; i<fields.length; i++) {
        assert.property(res, fields[i]);
      }
      done();
    });
    it('#getTopicSnapshot', function(done) {
      let topic = {
        order: 0,
        landing: true, 
        active: true,
        name: "test",
        boardMessage: "hello"
      }
      let res = sessionBuilderSnapshotValidation.getTopicSnapshot(topic);
      let fields = constants.sessionBuilderValidateChanges.topic.propertyFields.concat(constants.sessionBuilderValidateChanges.topic.listFields);
      for (let i=0; i<fields.length; i++) {
        assert.property(res, fields[i]);
      }
      done();
    });
    it('#getMailTemplateSnapshot', function(done) {
      let template = {
        content: "test1",
        subject: "test2"
      }
      let res = sessionBuilderSnapshotValidation.getMailTemplateSnapshot(template);
      let fields = constants.sessionBuilderValidateChanges.mailTemplate.fields;
      for (let i=0; i<fields.length; i++) {
        assert.property(res, fields[i]);
      }
      done();
    });
  });

  describe('hash', function(done) {
    it('hash check', function(done) {
      let hash1 = stringHelpers.hash("test1");
      let hash2 = stringHelpers.hash("test2");
      let hash3 = stringHelpers.hash(null);
      let hash4 = stringHelpers.hash("test2");
      assert.isNotNull(hash1);
      assert.isNotNull(hash3);
      assert.isDefined(hash2);
      assert.isDefined(hash3);
      assert.notEqual(hash1, hash2);
      assert.equal(hash2, hash4);
      done();
    });
  });

});
