'use strict';

var config = require('config').get("server");
var helpers = require('./helpers');
var mailTemplateService = require('../services/mailTemplate');
var ical = require('ical-generator');
var sanitizeHtml = require('sanitize-html');

var mailFrom = helpers.mailFrom();
var transporter = helpers.createTransport();

function extractImageResources(tepmlateHtml) {
  var resources = [];
  return {html: sanitizeHtml(tepmlateHtml, {
      transformTags: {
        'img': function(tagName, attribs) {
            let filename = attribs.src.split('/');
            let name = escape(filename[filename.length - 1]);
            let path = attribs.src;
            if (path.indexOf("/chat_room/upload") == -1) {
              path = "public" + path;
            } else {
              path = path.replace("/chat_room/uploads/", "chatRoom/public/uploads/");
            }

            console.log("___path", path);
            resources.push({filename: name, path: path, cid: name+"@kliiko"});
            attribs.src = "cid:"+name+"@kliiko";
            return {
                tagName: tagName,
                attribs: attribs
            };
        }
      },
      allowedTags:false,
      allowedAttributes: false,
      allowedSchemes: ['data', 'cid', 'http', 'https']
    }),
    resources: resources
  }
}

function sendMailWithTemplate(template, mailParams, callback) {
  let parsedTemplate = extractImageResources(template.content);
  transporter.sendMail({
    from: mailFrom,
    to: mailParams.email,
    subject: template.subject,
    html: parsedTemplate.html,//template.content
    attachments: parsedTemplate.resources
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
