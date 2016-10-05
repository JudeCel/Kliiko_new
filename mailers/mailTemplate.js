'use strict';

var helpers = require('./helpers');
var mailTemplateService = require('../services/mailTemplate');
var ical = require('ical-generator');
var moment = require('moment-timezone');
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
  if (path.indexOf("http://") == -1 && path.indexOf("https://") == -1) {
    path = "public" + path;
  }
  resources.push({filename: name, path: path, cid: name+"@att"});
  attribs.src = "cid:"+name+"@att";

  attribs.style += " padding: 0 15px 0 15px;";

  return {path: path, name: name};
}

function formatMailTemplate(tepmlateHtml) {
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
      exclusiveFilter: function(frame) {
        if (frame.attribs.style) {
          if(frame.tag =='span' && (frame.attribs.style.indexOf("color:red") != -1)) {
            return true;
          };
        }

        return false;
      },
      allowedTags:false,
      allowedAttributes: false,
      allowedSchemes: ['data', 'cid', 'http', 'https']
    }),
    resources: resources
  }
}

function sendMailWithTemplate(template, mailParams, callback) {
  let parsedTemplate = formatMailTemplate(template.content);
  transporter.sendMail({
    from: mailFrom,
    to: mailParams.email,
    subject: template.subject,
    html: parsedTemplate.html,//template.content
    attachments: parsedTemplate.resources
  }, callback);
}

function sendMailWithTemplateAndCalendarEvent(template, mailParams, callback) {
  let parsedTemplate = formatMailTemplate(template.content);

    let cal = ical({domain: process.env.SERVER_DOMAIN, name: template.name});
    let event = cal.createEvent({
        start: new Date(moment.tz(mailParams.orginalStartTime, mailParams.timeZone)),
        end:  new Date(moment.tz(mailParams.orginalEndTime, mailParams.timeZone)),
        timestamp: new Date(moment.tz(mailParams.orginalStartTime, mailParams.timeZone)),
        summary: template.name,
        timezone: mailParams.timeZone,
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
      html: parsedTemplate.html,
      //adds calendar event as attachment file
      attachments: [{
        filename: "event.ics",
        content: calendarData
      }].concat(parsedTemplate.resources)
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
  sendMailWithTemplateAndCalendarEvent: sendMailWithTemplateAndCalendarEvent,
  formatMailTemplate: formatMailTemplate
};
