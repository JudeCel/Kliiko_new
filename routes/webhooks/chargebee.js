"use strict";

let chargebeeModule = require('./../../modules/chargebee/chargebeeModule');

module.exports = {
  chargebeeHostedPageSuccessGet: chargebeeHostedPageSuccessGet,
  tstPost: tstPost,
};


function chargebeeHostedPageSuccessGet(req, res, next) {
  if (req.query.state !== 'succeeded') {
    res.send({error:'Something wrong with callback url. Not succeeded'});
    return;
  }
  if (!req.query.id) {
    res.send({error:'Can\'t retrieve hosted page id. @id query param is missed'});
    return;
  }


  let hostedPAgeId = req.query.id;

  chargebeeModule.createSubscription(hostedPAgeId).then(
    function(redirectUrl) {
      res.redirect(redirectUrl);
    },
    function(subsError) {
      res.send({error:subsError});
    }
  );

}


function tstPost(req, res) {

  User.find({
    where: {id: 2}
  }).then(function(resultUser) {

    resultUser.createSubscription({
      planId: 'planId',
        subscriptionId: 'AWERQ$XW',
      planQuantity: 2,
      status: 'status',
      trialStart: 1452499508854,
      trialEnd: 1452499508854,
      subscribtionCreatedAt: new Date(1452499508854),
      startedAt: 1452499508854,
      createdFromIp: '23.23.23.23',
      hasScheduledChanges: true,
      dueInvoicesCount:  1
    }).
    then(function(dbRes) {

      resultUser.getSubscriptions().then(function(subsRes) {
        res.send(subsRes);
      });
      //res.send(dbRes)
    }).
    catch( function(err) {
      res.send(err)
    });

   // res.send(resultUser)


  });

}