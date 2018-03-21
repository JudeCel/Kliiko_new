'use strict';

const api = require('infusionsoft-api');
const infusionsoft = new api.DataContext(process.env.INFUSIONSOFT_APP, process.env.INFUSIONSOFT_KEY);
const Bluebird = require('bluebird');

const CONTACT_PARAMS = ['Id', 'Email', 'FirstName', 'LastName'];
const MESSAGES = {
  contact: {
    notFound: { status: 400, message: 'Contact not found!' }
  }
};

module.exports = {
  tag: {
    load:   tagLoad,
    create: tagCreate,
    delete: tagDelete,
  },
  contact: {
    find:      contactFind,
    load:      contactLoad,
    create:    contactCreate,
    tagAdd:    contactTagAdd,
    tagRemove: contactTagRemove
  },
  TAGS: {
    optIn: 103,
    activated: 105,
    paidAccount: {
      starter: 540,
      essentials: 538,
      pro: 542,
    },
  }
};

function tagLoad(contact = {}) {
  if(!contact.Email) {
    return infusionsoft.ContactGroups.toArray();
  }
  else {
    return contactFind(contact).then(userTags);
  }
}

function tagCreate(params) {
  return infusionsoft.DataService.add('ContactGroup', params);
}

function tagDelete(id) {
  return infusionsoft.DataService.delete('ContactGroup', id);
}

function contactFind(contact) {
  return infusionsoft.Contacts.where(Contact.Email, contact.Email).first();
}

function contactLoad(id) {
  return infusionsoft.ContactService.load(id, CONTACT_PARAMS);
}

function contactCreate(params) {
  return infusionsoft.ContactService.addWithDupCheck(params, 'Email');
}

function contactTagAdd(contactId, tagId) {
  return infusionsoft.ContactService.addToGroup(contactId, tagId);
}

function contactTagRemove(contactId, tagId) {
  return infusionsoft.ContactService.removeFromGroup(contactId, tagId);
}

// Helpers
function userTags(contact) {
  return new Bluebird((resolve, reject) => {
    if(!contact) {
      reject(MESSAGES.contact.notFound);
    }
    else {
      infusionsoft.ContactGroupAssigns.where(ContactGroupAssign.ContactId, contact.Id).toArray().then(resolve).catch(reject);
    }
  });
}
