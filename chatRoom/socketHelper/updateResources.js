var mtypes = require('if-common').mtypes;
var expressValidatorStub = require('../tests/testHelpers/expressValidatorStub.js');

function updateResources(topic_id, user_id, content, type, Cb) {
    var req = expressValidatorStub({
        params: {
            topic_id: topic_id,
            user_id: user_id,
            type_id: mtypes.resourceType[type]
        }
    });

    content.type = type;

    if (~['image', 'video', 'vote', 'audio'].indexOf(type))
        req.params.JSON = encodeURI(JSON.stringify(content, null));

    var nextCb = function (err) {
        // TBD
        if(Cb)
            Cb(user_id, content);
    };

    var res = { send: function (data) {
        if(Cb)
            Cb(user_id, content);
    } };

    var createResource = require('../handlers/createResource.js');
    createResource.validate(req, function (err) {
        if (err) return nextCb(err);
        createResource.run(req, res, nextCb);
    });
}

module.exports = updateResources;
