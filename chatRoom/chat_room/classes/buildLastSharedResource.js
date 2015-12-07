/*
 build.LastSharedResource

 Basically this routine is designed to get the current objects from
 the DB, but only the ones after the screen was last erased

 Creating this as it's own class allows us to optimise this as much
 as we like without it touching the rest of the system.
 */
var build = namespace('sf.ifs.Build');

build.LastSharedResource = function () {
    //if (isEmpty(window.topic)) return;			//	we need this class up and running too

    //	lets get some chats
    window.socket.emit('getlastsharedresources', window.topicID);
}

/*
 json = [{
 //	sharedresource record
 }, {...}]
 */
build.LastSharedResource.prototype.processLastSharedResource = function (json) {
    if (!isEmpty(json)) {
        json = JSON.parse(json, null);

        var event = null;
        var consoleJSON = null;
        for (var ndx = 0, lr = json.length; ndx < lr; ndx++) {
            if (!isEmpty(json[ndx].event)) {
                event = JSON.parse(decodeURI(json[ndx].event), null);
                //	not really sure if this code is needed.  At any rate, we want to keep
                //	the original event.id if we can...
                if (isEmpty(event.id)) {
                    event.id = json[ndx].id;
                }

                event.updateEvent = false;

                window.topic.getConsole().setConsole(event);
            }
        }
    }


    //	OK, this has finished...
    window.initFinished = window.initFinished + window.FINISHED_LASTSHAREDRESOURCE;

    //if (window.initFinished === window.FINISHED_ALL) {
    window.playbackFinished();
    //}
}