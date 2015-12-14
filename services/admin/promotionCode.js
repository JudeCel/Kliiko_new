'use strict';
var promotionCode  = require('./../../models').promotionCode;
var crypto = require('crypto');

function list(callback){
 promotionCode.findAll({order: 'name ASC'})
  .then(function (result) {
    callback(result);
  });
};

function edit(params, callback){
	params['promotionCode'] = generateCode;

	promotionCode.find({where: {id: id}}).done(function (result) {
    if (result) {
      result.update({
        params
      })
      .then(function (result) {
        return callback(null, result);
      })
      .catch(function (err) {
        callback(err);
      });
    } else {
      callback("There is no promotion code with id: " + params.id);
    };
  });
};

function destroy(id, callback){
	promotionCode.find({where: {id: id}}).done(function (result) {
		if (result) {
			result.destroy().then(function (result) {
        callback(null, result);
      })
      .catch(function (err) {
        callback(err);
      });
		} else {
      callback("There is no promotion code with id: " + id);
    };
	});
};

function generateCode(callback){
	let token = crypto.randomBytes(10).toString('hex');
	callback(null, token)
};