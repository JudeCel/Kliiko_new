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
    function(respose) {
      // sample json response:
      // https://apidocs.chargebee.com/docs/api/hosted_pages#retrieve_a_hosted_page


      let hostedPageData = respose.hosted_page;
      let redirectPage = JSON.parse(hostedPageData.pass_thru_content).successAppUrl;
      let userId = JSON.parse(hostedPageData.pass_thru_content).userId;

      res.redirect(redirectPage);
      //res.send(respose)
    },
    function(error) { res.send({error:error}) }
  );

}
