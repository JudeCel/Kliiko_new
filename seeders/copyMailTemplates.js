'use strict';
var MailTemplateService = require('./../services/mailTemplate');
var async = require('async');

function copyFromMailTemplates(callback) {
   MailTemplateService.copyBaseTemplates(function(error, result){
    callback(error, result);
  });
}

function createMailTemplateCopies() { 
    copyFromMailTemplates(function (error, _result) {
        if (error) {
            console.log("create mail template copies error", error);
        } else {
            console.log("create mail template copies success", _result);
        }
        process.exit();
    });
}

createMailTemplateCopies();