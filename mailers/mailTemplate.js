'use strict';

var helpers = require('./helpers');
var ical = require('ical-generator');
var moment = require('moment-timezone');
var sanitizeHtml = require('sanitize-html');
var _ = require('lodash');

var mailFrom = helpers.mailFrom();
var { sendMail } = require('./adapter');

function preparePathData (attribs, resources) {
  let filename = attribs.src.split('/');
  let realFilename = filename[filename.length - 1].split('?')[0];
  let extentionArray = realFilename.split(".");
  let extension = extentionArray.length ? extentionArray[extentionArray.length - 1] : "";
  let name = _.camelCase(realFilename)+"."+extension;
  let path = attribs.src;
  if (path.indexOf("http://") == -1 && path.indexOf("https://") == -1 && path.indexOf("data") === -1) {
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
  sendMail({
    from: mailFrom,
    to: mailParams.email,
    subject: template.subject,
    html: parsedTemplate.html,//template.content
    attachments: parsedTemplate.resources
  }).then((resp) => {
    callback(null, resp);
  }, (error) => {
    callback(error);
  });
}

function sendMailWithTemplateAndCalendarEvent(template, mailParams, callback) {
  let parsedTemplate = formatMailTemplate(template.content);
    let cal = ical({domain: process.env.SERVER_DOMAIN, name: template.name, timezone: mailParams.timeZone});
    let event = cal.createEvent({
        start: new Date(mailParams.orginalStartTime),
        end:  new Date(mailParams.orginalEndTime),
        summary: template.name,
        organizer: mailFrom
    });

    /*
    // add attendees to event when known
        event.attendees([
        {email: 'someMail@gmail.com', name: 'Person A'},
    ]);
    */

    let calendarData =  cal.toString();
    let urlCalendarData = encodeURI(new Buffer(calendarData).toString('base64'));

    sendMail({
      from: mailFrom,
      to: mailParams.email,
      subject: template.subject,
      html: parsedTemplate.html.replace("{Calendar}", helpers.getUrl('', null, '/ics?icsdata=' + urlCalendarData)),
      //adds calendar event as attachment file
      attachments: [{
        filename: "event.ics",
        content: calendarData
      }].concat(parsedTemplate.resources)
      //makes this mail as calendar event in Outlook and Gmail with html data as content
      /*
      alternatives: [{
        contentType: "text/calendar; method=REQUEST; name=event.ics; component=VEVENT",
        content: new Buffer(calendarData),
        cid: "event.ics@att"
      }]
      */
    }).then((resp) => {
      callback(null, resp);
    }, (error) => {
      callback(error);
    });
}

module.exports = {
  sendMailWithTemplate: sendMailWithTemplate,
  sendMailWithTemplateAndCalendarEvent: sendMailWithTemplateAndCalendarEvent,
  formatMailTemplate: formatMailTemplate
};
