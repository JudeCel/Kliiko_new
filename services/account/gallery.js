'use strict';

var q = require('q');
var models = require('./../../models')
var account = models.Account;
var Resource = models.Resource;
var expressValidatorStub = require('../../chatRoom/helpers/expressValidatorStub.js');
var updateTmpTitle = require('../../chatRoom/handlers/updateTmpTitle.js');

module.exports = {
  getResources: getResources,
  downloadResources: downloadResources,
  deleteResources: deleteResources,
  uploadResource: uploadResource
};

function getResources(accountName){
  let deferred = q.defer();
  let accountId = 3;

  Resource.findAll({
    include: [{
        model: models.User, 
        include: [{
          model: models.Account,
          where: { id: accountId }
        }]
      }],
      attributes: ['id', 'userId', 'thumb_URL', 'URL', 'HTML', 'JSON', 'resourceType']
    })
    .then(function (results) {
      results.forEach(function(resource, index, array) {
        delete resource.dataValues.User;
        resource.JSON = JSON.parse(decodeURI(resource.JSON));
      });
      deferred.resolve(results);
    })
    .catch(function (err) {
      deferred.reject(err);
    });
  return deferred.promise;
}

function deleteResources(ids){
  let deferred = q.defer();

  Resource.destroy({ where: ids})
    .then(function(result) {
      deferred.resolve(ids);
    }
  ).catch(function(err) {
    deferred.reject(err);
  });

  return deferred.promise;
}

function downloadResources(ids){
  let deferred = q.defer();


  return deferred.promise;
}

function uploadResource(data){
  console.log("settmptitle");

  let content = {
    title: data.title,
    text: data.text
  };

  let req = expressValidatorStub({
    params: {
      userId: data.userId,
      // topicId: data.topicId,
      URL: "url",
      JSON: content
    }
  });

  console.log(req);

  var resCb = function (result) {
    if (!result) return;
    io.connected[socket.id].emit('submitform', formID);
  };

  var nextCb = function (err) {
    // TBD
  };
  
  updateTmpTitle.validate(req, function (err) {
    if (err){

    }else{
      updateTmpTitle.run(req, res, nextCb);
    }
  });

  // // let deferred = q.defer();

  // let params = {
  //   file: req.files,
  //   width: 950,
  //   height: 460,
  //   type: 'image',
  //   resCb: function(userId, Json) {
  //     console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")
  //     console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")
  //   }
  // };

  // uploadNewResource.saveResourceToDisk(params);

  // // return deferred.promise;
}

function uploadResourceCallback(userId, json) {

}