"use strict";

let chargebeeModule = require('./../../modules/chargebee/chargebeeModule');

module.exports = {
  chargebeeHostedPageSuccessGet: chargebeeHostedPageSuccessGet,
};


function chargebeeHostedPageSuccessGet(req, res, next) {
  if (!req.query.id) {
    res.send({error:'id query param is missed'});
    return;
  }
  chargebeeModule.getHostedPageData(req.query.id).then(
    function(respose) { res.send(respose) },
    function(error) { res.send({error:error}) }
  );

}
