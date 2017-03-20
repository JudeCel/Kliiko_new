'use strict';

const assert = require('chai').assert;
const infusionsoft = require('./../../lib/infusionsoft');

const USER_PARAMS = {
  FirstName: 'Test',
  LastName: 'Test',
  Email: 'some@email.com'
};

describe('LIB - InfusionSoft', () => {
  describe('#tagLoad', () => {
    it('should load all tags', (done) => {
      infusionsoft.tag.load().then((data) => {
        assert.equal(data.length > 0, true);
        done();
      }).catch(done);
    });

    describe('user', () => {
      var contactId, tagId;

      before((done) => {
        infusionsoft.contact.create(USER_PARAMS)
          .then(infusionsoft.contact.load)
          .then((contact) => {
            contactId = contact.Id;
            return infusionsoft.tag.create({ GroupName: 'Test', GroupDescription: 'Test tag' });
          })
          .then((id) => {
            tagId = id;
            return infusionsoft.contact.tagAdd(contactId, tagId);
          }).then(() => done()).catch(done);
      });

      it('should load all user tags', (done) => {
        infusionsoft.tag.load(USER_PARAMS)
          .then((data) => {
            assert.equal(data.length, 1);
            assert.equal(data[0].GroupId, tagId);
            done();
          }).catch(done);
      });

      after((done) => {
        if(contactId && tagId) {
          infusionsoft.contact.tagRemove(contactId, tagId)
            .then(() => infusionsoft.tag.delete(tagId))
            .then(() => done())
            .catch(done);
        }
      });
    });
  });
});
