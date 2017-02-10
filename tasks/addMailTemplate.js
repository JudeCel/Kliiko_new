'use strict';

var updateBaseMailTemplatesLogic = require('./updateBaseMailTemplatesLogic.js');
var constants = require('./../util/constants');

var templateInfo = {
  fileName: 'SystemEmail_EmailNotification.html',
  name: constants.mailTemplateType.emailNotification,
  type: "emailNotification",
  subject: "Message Notification {Session Name}",
  systemMessage: true
}

updateBaseMailTemplatesLogic.addMailTemplate(templateInfo).then(function() {
  process.exit();
}, function(error){
  process.exit();
});
