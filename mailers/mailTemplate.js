'use strict';

var config = require('config').get("server");
var helpers = require('./helpers');
var mailTemplateService = require('../services/mailTemplate');
var ical = require('ical-generator');

var mailFrom = helpers.mailFrom();
var transporter = helpers.createTransport();

function sendMailWithTemplate(template, mailParams, callback) {  
  transporter.sendMail({
    from: mailFrom,
    to: mailParams.email,
    subject: template.subject,
    html: template.content
  }, callback);
}

function sendMailWithTemplateAndCalendarEvent(template, mailParams, callback) {  
    let cal = ical({domain: config.domain, name: template.name});
    let event = cal.createEvent({
        start: mailParams.start,
        end: mailParams.end,
        timestamp: mailParams.start,
        summary: template.name,
        organizer: mailFrom
    });
    
    /*
    // add attendees to event when known
        event.attendees([
        {email: 'warlockxins@gmail.com', name: 'Person A'},        
    ]);
    */
    
    let calendarData =  cal.toString();
    
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
