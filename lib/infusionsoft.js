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
    load:      contactLoad,
    create:    contactCreate,
    tagAdd:    contactTagAdd,
    tagRemove: contactTagRemove
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
function contactFind(contact) {
  return infusionsoft.Contacts.where(Contact.Email, contact.Email).first();
}

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
