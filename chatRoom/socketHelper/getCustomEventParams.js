/*
 Renamed from getUpdateEventsParams.js
 */
var _ = require('lodash');
var joi = require('joi');

module.exports = function getCustomEventParams(params) {
    var result = {
        isValid: false,
        tag: 0 //default to image
    };

    var err = joi.validate(params, {
        topicId: joi.number().required(),
        userId: joi.number().required(),
        command: joi.string().required(),
        event: joi.string().optional(),
        encodingRequired: joi.types.Boolean().optional()
    });

    if (err)
        throw err;

    params = _.defaults(_.clone(params || {}), {
        encodingRequired: true
    });

    result.event = params.encodingRequired ? encodeURI(params.event) : params.event;

    var json = null;
    if (params.event) {
        try {
            json = JSON.parse(params.event);
        }
        catch (ex) {
            json = JSON.parse(decodeURI(params.event));
        }
    }


    switch (params.command) {
        case 'shareresource':
        {
            if (json)
                switch (json.type) {
                    case 'image':
                        result.tag = 0;
                        break;
                    case 'vote':
                        result.tag = 1;
                        break;
                    case 'audio':
                        result.tag = 2;
                        break;
                    case 'video':
                        result.tag = 4;
                        break;
                    case 'pictureboard':
                        result.tag = 32;
                        break;
                    case 'null':
                        result.tag = 65536;
                        break;
                }
        }
            break;
        case 'image':
            result.tag = 0;
            break;

        case 'vote':
            result.tag = 1;
            try {
                if (json && json.id)
                    result.replyId = json.id
            } catch (e) {
            }
            break;
        case 'audio':
            result.tag = 2;
            break;

        case 'video':
            result.tag = 4;
            break;

        case 'chat':
            result.tag = 8;
            try {
                if (json && json.object && json.object.mode)
                    result.replyId = json.object.mode.messageId;
            } catch (e) {
            }
            break;

        case 'object':
            result.tag = 16;
            break;

        case 'pictureboard':
            result.tag = 32;
            break;

        case 'null':
            result.tag = 65536;
            break;
    }

    if (json) {
        result.responseObject = json.object;
        if (result.responseObject)
            result.responseObject.tag = result.tag;
    }

    result.isValid = true;
    return result;
};