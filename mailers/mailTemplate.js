'use strict';

var helpers = require('./helpers');
var mailTemplateService = require('../services/mailTemplate');
var ical = require('ical-generator');
var sanitizeHtml = require('sanitize-html');
var _ = require('lodash');

var mailFrom = helpers.mailFrom();
var transporter = helpers.createTransport();

function preparePathData (attribs, resources) {
  let extentionArray = attribs.src.split(".");
  let extension = "";
  if (extentionArray.length) {
    extension = extentionArray[extentionArray.length - 1];
  }
  let filename = attribs.src.split('/');
  let name = _.camelCase(filename[filename.length - 1])+"."+extension;
  let path = attribs.src;
  if (path.indexOf("/chat_room/upload") == -1) {
    path = "public" + path;
  } else {
    path = path.replace("/chat_room/uploads/", "chatRoom/public/uploads/");
  }
  resources.push({filename: name, path: path, cid: name+"@att"});
  attribs.src = "cid:"+name+"@att";

  attribs.style += " padding: 0 15px 0 15px;";

  return {path: path, name: name};
}

function extractImageResources(tepmlateHtml) {
  var resources = [];
  return {html: sanitizeHtml(tepmlateHtml, {
      transformTags: {
        'img': function(tagName, attribs) {
            let pData = preparePathData(attribs, resources);
            return {
                tagName: tagName,
                attribs: attribs
            };
        },
        'table': function(tagName, attribs) {
          if (!attribs.style) {
            attribs.style = "";
          }
          attribs.style += "padding: 0 15px 0 15px;";
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
    let cal = ical({domain: prcoess.env.SERVER_DOMAIN, name: template.name});
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
