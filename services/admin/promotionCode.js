'use strict';
var promotionCode  = require('./../../models').promotionCode;
var crypto = require('crypto');

function list(callback){
 promotionCode.findAll({order: 'name ASC'})
  .then(function (result) {
    callback(null, result);
  });
};

function create(params, callback){
  generateCode(function(result) {
    params['code'] = result;
  });
  
  promotionCode.create(params).then(function(result) {
    callback(null, result);
  }).catch(promotionCode.sequelize.ValidationError, function(err) {
    callback(err);
  }).catch(function(err) {
    callback(err);
  });
};

function edit(params, callback){
	promotionCode.find({where: {id: params.id}}).done(function (result) {
    if (result) {
      result.update(params).then(function (result) {
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
	callback(token)
};


module.exports = {
  create: create,
  list: list,
  edit: edit,
  destroy: destroy
}
