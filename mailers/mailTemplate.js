'use strict';

var config = require('config');
var helpers = require('./helpers');
var mailTemplateService = require('../services/mailTemplate');
var ical = require('ical-generator');

var mailFrom = helpers.mailFrom();
var transporter = helpers.createTransport();

function sendMailWithTemplate(template, mailParams, callback) {  
  console.log("__t:", template);
  transporter.sendMail({
    from: mailFrom,
    to: mailParams.email,
    subject: template.subject,
    html: template.content
  }, callback);
}

function sendMailWithTemplateAndCalendarEvent(template, mailParams, callback) {  
    var cal = ical({domain: 'google.com', name: template.name});
    var event = cal.createEvent({
        start: mailParams.start,
        end: mailParams.end,
        timestamp: mailParams.start,
        summary: template.name,
        organizer: '<insiderfocus.noreply@gmail.com>'
        //organizer: 'Name Lastname <insiderfocus.noreply@gmail.com>'
    });
    
    /*
    // add attendees to event when known
        event.attendees([
        {email: 'warlockxins@gmail.com', name: 'Person A'},        
    ]);
    */
    
    var calendarData =  cal.toString();
    
    transporter.sendMail({
      from: mailFrom,
      to: mailParams.email,
      subject: template.subject,
      html: template.content,
      //adds calendar event as attachment file
      attachments: [{
        filename: "event.ics",
        content: calendarData
      }]
      //makes this mail as calendar event in Outlook and Gmail with html data as content
      /*
      alternatives: [{
        contentType: "text/calendar; method=REQUEST; name=event.ics ;component=VEVENT",
        content: new Buffer(calendarData)
      }]
      */
    }, callback);
}

module.exports = {
  sendMailWithTemplate: sendMailWithTemplate,
  sendMailWithTemplateAndCalendarEvent: sendMailWithTemplateAndCalendarEvent
};
