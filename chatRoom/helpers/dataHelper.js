module.exports.getTimestamp = function () {
    return Math.round((new Date()).getTime() / 1000);
}

//We need to make sure no spaces (" ") exist in the filename. We should also remove any apostropes.
module.exports.clearFileNameExtraSymbols = function (initialFileName) {
    return initialFileName.replace(/ /g, "_").replace(/'/g, "");
}

//We need to make sure no spaces (" ") exist in the filename. We should also remove any apostropes.
module.exports.getResourceFileName = function (initialFileName) {
    var date = new Date();
    var filename = initialFileName.substr(0, initialFileName.lastIndexOf('.'));
    var ext = initialFileName.split('.').pop();

    return filename + "_" + (date * 1) + '.' + ext;
}
