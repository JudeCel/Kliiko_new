var _ = require('lodash');

module.exports = function (req) {
	var validator = {
		assert: function () {
			return validator;
		},
		notEmpty: function () {
			return validator;
		},
		isInt: function () {
			return validator;
		},
		validationErrors: function () {
			return null;
		},
		checkHeader: function (i) {
			return validator;
		},
		arrayNotEmpty: function (i) {
			return validator;
		},
		isIntArray: function (i) {
			return validator;
		},
		isInIntArray: function (i) {
			return validator;
		},
		isIntOrEmptyArray: function (i) {
			return validator;
		},
		isEmail: function (i) {
			return validator;
		},
		len: function (i) {
			return validator;
		},
		featureEnabledForAccount: function (i) {
			return validator;
		},
		regex: function (i) {
			return validator;
		},
		seriesEnabledForAccount: function (i) {
			return validator;
		}
	};
	var sanitizer = {
		sanitize: function (i) {
			return sanitizer;
		},
		toInt: function (i) {
			return sanitizer;
		},
		toBoolean: function (i) {
			return sanitizer;
		},
		trim: function (i) {
			return sanitizer;
		},
		xss: function (i) {
			return sanitizer;
		}
	};
	var o = _.extend(validator, sanitizer);
	return _.extend(o, req);
};
