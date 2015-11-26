module.exports = {
	enqueryVote: require('./enqueryVote.js'),
	uploadResource: require('./saveResourceToDisk.js'),
  updateResources: require('./updateResources.js'),
  uploadCallback: require('./saveResourceToDb.js'),
  getCustomEventParams: require('./getCustomEventParams.js'),
  deleteAllEvents: require('./deleteAllEvents.js'),
  updateEvent: require('./updateEvent.js'),
	createCustomEvent: require('./createCustomEvent.js'),
  updateCustomEvent: require('./updateCustomEvent.js'),
  createLog: require('./createLog.js'),
	dbHelper: require('./dbHelper.js')
};
