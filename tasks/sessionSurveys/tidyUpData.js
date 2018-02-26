let sessionSurvey = require('./../../services/sessionSurvey');
let {SessionSurvey, Session, Survey} = require('./../../models');
let Bluebird = require('bluebird');
let _ = require('lodash');
const removeDuplications = () => {
    return new Bluebird(function (resolve, reject) {
        SessionSurvey.findAll({
            attributes: ["sessionId"],
            group: ["sessionId"],
            having: ['COUNT(?) >= ?', '"sessionId"', 4]
        }).then((result) => {
            let ids = result.map((item) => {
                return item.sessionId
            })

            Bluebird.each(ids, (id) => {
                return new Bluebird(function (resolve, reject) {
                    SessionSurvey.findAll({
                        where: {sessionId: id}, 
                        attributes: ["id", "createdAt", "surveyId"],
                        order: ["createdAt"],
                    }
                    ).then((result) => {
                        let deleteItems = _.drop(result, 2).map((item) => {
                            return item.surveyId;
                        })

                        return Survey.destroy({ where: { id: { $in: deleteItems }}}).then((result) =>{
                            resolve(result);
                        })
                    })
                })
            }).then((result) => {
                resolve();
            })
        }) .catch((error) => {
            reject(error);
        })
    })
}

removeDuplications()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit();
  });
