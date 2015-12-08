"use strict";
var util = require('util');
var _ = require('lodash');

function WebFaultHelper() {

	function getFault(error) {
		error = error || {};
		var statusCode = error.statusCode || 500;
		var message = getErrorMessage(error);
		var logLevel = error.logLevel || 'ERROR';

		if (util.isError(error)) {
			error.statusCode = statusCode;
			error.message = message;
			return error;
		}

		var newError = new Error();
		newError.statusCode = statusCode;
		newError.message = message;
		newError.logLevel = logLevel;
		return newError;
	}

	function getAuthFault(message) {
		var error = new Error();
		error.statusCode = 401;
		error.message = message || 'Unauthorized';
		error.logLevel = 'WARN';
		return error;
	}

	function getDetailedAuthFault(faultObj) {
		if(!_.isString(faultObj))
			faultObj = JSON.stringify(faultObj);

		var error = new Error();
		error.statusCode = 401;
		error.message = faultObj;
		error.data = faultObj;
		error.logLevel = 'WARN';
		return error;
	}

	function getValidationFault(errors) {
		if (!errors)
			return null;
		// empty express-validator
		if (_.isArray(errors) && errors.length === 0)
			return null;
		// empty joi
		if (errors._errors && errors._errors.length === 0)
			return null;

		var error = new Error();
		error.statusCode = 400;
		error.logLevel = 'WARN'
		error.message = errors;
		error.data = errors; // assume express-validator
		error.innerError = errors;

		// joi
		if (errors._errors) {
			error.data = errors._errors;
			error.innerError = errors._errors;
		}

		return error;
	}

	function getErrorMessage(error) {
		var defaultErrorMessage = 'An error has occurred';
		if (!error)
			return defaultErrorMessage;

		if (_.isString(error))
			return error;

		if (_.isArray(error))
			return error.join(', ');

		if (error.message)
			return error.message;

		if (error.body && error.body.Message)
			return error.body.Message;

		return defaultErrorMessage;
	}

	return {
		getFault: getFault,
		getAuthFault: getAuthFault,
		getDetailedAuthFault: getDetailedAuthFault,
		getValidationFault: getValidationFault,
		getErrorMessage: getErrorMessage
	};
};
module.exports = new WebFaultHelper();
