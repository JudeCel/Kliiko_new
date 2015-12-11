var mtypes = require("../helpers/mtypes");
var getResourcesGeneric = require('../handlers/getResourcesGeneric.js');

function saveResourceToDb(json, resCb, nextCb) {
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    //	this bit of code is interesting,
    //	1)	We will first get all the resources currently uploaded by looking
    //		looking at the resources table where the resource_type is tmp.
    //	2)	With those rows from the resources table, we will look for the
    //		json.filename.
    //	3)	Once we have a match, we can get the userId
    //	4)	The userId allows us to get the connection so we can send
    //		information back to our client.
    var req = {
        resource_type: 'tmp'
    };

    getResourcesGeneric.execute(req, handleAllTempResources, nextCb);

    var isAlreadyUpdateResources = false;
    function handleAllTempResources(resources) {
        for (var rid = 0; rid < resources.length; rid++) {
            if(isAlreadyUpdateResources)
                break;

            var resource = resources[rid];
            if (!resource.JSON)
                continue;

            var resultJSON = null;
            try {
                resultJSON = JSON.parse(decodeURI(resource.JSON), null);
            }
            catch (ex) {
            }

            if (!resultJSON)
                continue;

            if (resultJSON.text)
                resultJSON.text = resultJSON.text.replace(/ /g, "_");
            else
                continue;

            if (resultJSON.text.toLowerCase() === json.matchName.toLowerCase()) {
                var req = {
                    resource_type: 'tmp'
                };

                req.userId = json.userId = resource.userId;
                req.topicId = json.topicId = resource.topicId;

                getResourcesGeneric.execute(req, function (result) {
                    var socketHelper = require('../socketHelper.js');
                    if (result && result.length) {
                        var resultJson = null;
                        try {
                            resultJson = JSON.parse(decodeURI(result[0].JSON), null);
                        }
                        catch (ex) {
                        }

                        if (resultJson) {
                            json.title = resultJson.title;	//	lets add our label


                            if(isAlreadyUpdateResources == false){
                                isAlreadyUpdateResources = true;
                                socketHelper.updateResources(json.topicId, json.userId, json, json.type, resCb);

                                switch (json.type) {
                                    case 'collage':
                                        socketHelper.createCustomEvent(json.topicId, json.userId, "collage", JSON.stringify(json, null));
                                        break;
                                }
                            }
                        }
                        else
                        resCb(resource.userId, json);
                    }
                }, nextCb)
            }
        }
    }
}

module.exports = saveResourceToDb;
