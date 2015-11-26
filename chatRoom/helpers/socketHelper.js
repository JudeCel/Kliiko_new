module.exports = {
	enqueryVote: require('./socketHelper/enqueryVote.js'),
	uploadResource: require('./socketHelper/saveResourceToDisk.js'),
  updateResources: require('./socketHelper/updateResources.js'),
  uploadCallback: require('./socketHelper/saveResourceToDb.js'),
  getCustomEventParams: require('./socketHelper/getCustomEventParams.js'),
  deleteAllEvents: require('./socketHelper/deleteAllEvents.js'),
  updateEvent: require('./socketHelper/updateEvent.js'),
	createCustomEvent: require('./socketHelper/createCustomEvent.js'),
  updateCustomEvent: require('./socketHelper/updateCustomEvent.js'),
  createLog: require('./socketHelper/createLog.js'),
	dbHelper: require('./socketHelper/dbHelper.js')
};
