module.exports = {
  subscription: require('./subscription.js').validate,
  planAllowsToDoIt: require('./subscription.js').planAllowsToDoIt,
  hasValidSubscription: require('./hasValidSubscription.js').validate
};
