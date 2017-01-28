'use strict';

var MessagesUtil = require('./../util/messages');
var q = require('q');
var _ = require('lodash');
var models = require('./../models');
var filters = require('./../models/filters');
var AccountUser = models.AccountUser;
var ContactList = models.ContactList;
var ContactListUser = models.ContactListUser;
var AccountUserService = require('./accountUser');
var dataWrappers = require('./../models/dataWrappers');
var validators = require('./validators');
var async = require('async');
var Bluebird = require('bluebird');

module.exports = {
  findByContactList: findByContactList,
  find: find,
  create: create,
  update: update,
  destroy: destroy,
  updatePositions: updatePositions,
  bulkCreate: bulkCreate,
  contactListUserParams: contactListUserParams,
  destroyByToken: destroyByToken,
  comments: comments
};

function wrappersContactListUser(item, list) {
  return new dataWrappers.ContactListUser(
    list.defaultFields,
    list.customFields,
    list.participantsFields,
    list.visibleFields,
    item
  );
}

function buildWrappedResponse(contactListUserId, deferred, transaction) {
  ContactListUser.find({where: {id: contactListUserId },
    include: [ ContactList, AccountUser ], transaction: transaction }
    ).then(function(result) {
    if (result) {
      let newCLU = wrappersContactListUser(result, result.ContactList);
      deferred.resolve(newCLU);
    }else {
      deferred.reject(MessagesUtil.contactListUser.notFound);
    }
  }, function(err) {
    deferred.reject(err);
  });
}

function findByContactList(contactListId) {
    let deferred = q.defer();
    ContactListUser.findAll({
      order: ['position'],
      include: [{model: ContactList, where: { id: contactListId} } ]
    }).then(function(results) {

      let collection = _.map(results, (item) => {
        collection.push(
          wrappersContactListUser(item, item.ContactList)
        );
      })

      deferred.resolve(collection);
    }, function(err) {
      deferred.reject(err);
    });
    return deferred.promise;
}

// params = [{id: 1, position: 3}, ...]
function updatePositions(params) {
  // TODO: Need rewrite to one DB call!!!
  let deferred = q.defer();
    async.map(params, update, function(err, result) {
      if (err) {
        deferred.reject(err);
      }else{
        deferred.resolve(result);
      }
    })
  function update(attrs, cb) {
    ContactListUser.update({position: attrs.position }, {where: {id: attrs.id}}).then(function(result) {
      cb(null,result);
    }, function(err) {
      cb(err);
    })
  }
  return deferred.promise;
}

function destroy(ids, accountId) {

  let deferred = q.defer();
  ContactListUser.destroy({where: { id: ids, accountId: accountId}}).then(function(result) {
    deferred.resolve(result);
  }, function(err) {
    deferred.reject(err);
  });
  return deferred.promise;
}

function destroyByToken(token) {
  let deferred = q.defer();
  ContactListUser.destroy({where: { unsubscribeToken: token}}).then(function(result) {
    deferred.resolve(result);
  }, function(err) {
    deferred.reject(err);
  });
  return deferred.promise;
}

function find(id) {
    let deferred = q.defer();
    buildWrappedResponse(id, deferred);
    return deferred.promise;
}

function transactionFun(t, accountId, errors) {
  return function(attrs, callback) {
    attrs.accountId = accountId;
    create(attrs, t).then(function(result) {
      callback(null, result);
    }, function(error) {
      errors.required = true;
      assignErrorWithRowNr(errors, error, attrs);
      callback();
    });
  }
}

function assignErrorWithRowNr(errors, error, attrs) {
  errors[attrs.rowNr] = error;
}

function bulkCreate(list, accountId) {
  let errors = {required: false};
  let deferred = q.defer();

  models.sequelize.transaction().then(function(t) {
    async.map(list, transactionFun(t, accountId, errors), function(err, results) {
      if (errors.required) {
        t.rollback().then(function() {
          deferred.reject(errors);
        });
      }else {
        t.commit().then(function() {
          deferred.resolve(results);
        });
      }
    });
  });

  return deferred.promise;
}

function validateUniqEmail(params, transaction) {
  let deferred = q.defer();
  ContactListUser.find(
    { where: {
      contactListId: params.contactListId,
      accountId: params.accountId
    },
    include: [{model: AccountUser, where: {
      email: { ilike: params.defaultFields.email }
    }}]
  },{ transaction: transaction }).then(function(result) {
    if (result) {
      let message = {errors: [
        { path: 'email',
          message: ' must be unique'
        }
        ]
      }
      deferred.resolve(filters.errors(message));
    }else {
      deferred.resolve(false);
    }
  })
  return deferred.promise;
}

function create(params, transaction) {
  let deferred = q.defer();
  let errors = {};

  validators.hasValidSubscription(params.accountId).then(function() {
    validateUniqEmail(params).then(function(result) {
      if(result) {
        _.merge(errors, result)
      }

      AccountUser.find(
        { where: {
          email: { ilike: params.defaultFields.email },
          AccountId: params.accountId
        }
      }).then(function(accountUser) {
        if (accountUser && !_.has(errors, 'email')) {
          if(!accountUser.UserId) {
            updateAccountUserIfUserFound(accountUser, params.defaultFields.email, transaction).then(function(au) {
              ContactListUser.create(contactListUserParams(params, au), {transaction: transaction}).then(function(contactListUser) {
                buildWrappedResponse(contactListUser.id, deferred, transaction);
              }, function(err) {
                deferred.reject(err);
              });
            }, function(error) {
              deferred.reject(error);
            });
          }
          else {
            ContactListUser.create(contactListUserParams(params, accountUser), {transaction: transaction}).then(function(contactListUser) {
              buildWrappedResponse(contactListUser.id, deferred, transaction);
            }, function(err) {
              deferred.reject(err);
            })
          }
        }else{
          createNewAccountUser(params, transaction).then(function(newAccountUser) {
            if(_.isEmpty(errors)){
              ContactListUser.create(contactListUserParams(params, newAccountUser), {transaction: transaction}).then(function(contactListUser) {
                buildWrappedResponse(contactListUser.id, deferred, transaction);
              }, function(err) {
                deferred.reject(err);
              })
            }else{
              deferred.reject(errors);
            }
          }, function(err) {
            _.merge(errors, filters.errors(err))
            deferred.reject(errors);
          })
        }
      });

    })
  }, function(error) {
    deferred.reject({subEnded: error});
  })

  return deferred.promise;
}

function createNewAccountUser(params, transaction) {
  let deferred = q.defer();
  ContactList.find({where: {id: params.contactListId}}).then(function(contactList) {
    AccountUserService.create(params.defaultFields, params.accountId, (params.role || contactList.role), transaction).then(function(accountUser) {
      updateAccountUserIfUserFound(accountUser, params.defaultFields.email, transaction).then(function(accountUser) {
        deferred.resolve(accountUser);
      }, function(error) {
        deferred.reject(error);
      });
    }, function(err) {
      if(err.name == 'SequelizeUniqueConstraintError') {
        err.errors = [{message: "Email has already been taken", type: "Validation error", path: "email"}];
        deferred.reject(err);
      }else {
        deferred.reject(err);
      }
    })
  })
  return deferred.promise;
}

function updateAccountUserIfUserFound(accountUser, email, transaction) {
  let deferred = q.defer();

  models.User.find({ where: { email: { ilike: email } } }).then(function(user) {
    if(user) {
      accountUser.update({ UserId: user.id }, { transaction: transaction, returning: true }).then(function(au) {
        deferred.resolve(au);
      }, function(error) {
        deferred.reject(filters.errors(error));
      });
    }
    else {
      deferred.resolve(accountUser);
    }
  });

  return deferred.promise;
}

function contactListUserParams(params, accountUser) {
  return {
    userId: accountUser.UserId,
    accountUserId: accountUser.id,
    accountId: params.accountId,
    contactListId: params.contactListId,
    customFields: params.customFields || {}
  }
}

function update(params) {
  let deferred = q.defer();

  validators.hasValidSubscription(params.accountId).then(function() {
    //params.id can be AccountUser Id or ContactListUser Id depends on input data from frontend - is it invited or not
    let where = params.defaultFields.status ? {accountId: params.accountId, accountUserId: params.id} : {id: params.id};
    ContactListUser.find({where: where, include: [AccountUser, ContactList]}).then(function(contactListUser) {
      let customFields = _.merge(contactListUser.customFields,  params.customFields)
      contactListUser.updateAttributes({customFields: customFields}).then(function(result) {
        contactListUser.AccountUser.updateAttributes(params.defaultFields).then(function(accountUser) {
          buildWrappedResponse(contactListUser.id, deferred);
        }, function(err) {
          deferred.reject(filters.errors(err));
        })
      }, function(err) {
        deferred.reject(filters.errors(err));
      })
    })
  }, function(error) {
    deferred.reject({subEnded: error});
  })

  return deferred.promise;
}

function comments(params) {
  return new Bluebird(function (resolve, reject) {
    models.SessionMember.findAll({
      include: [
        { model: AccountUser, include: [{ model: ContactListUser, where: {id: params.id, contactListId: params.contactListId} }] },
        { model: models.Session, attributes: ['name'] },
      ], 
      where: { $and: [{comment: {$ne: null}}, {comment: {$ne: ''}}] },
      attributes: ['comment']
    }).then(function(res) {
      let result = [];
      _.map(res, (item) => {
        result.push({session: item.Session.dataValues.name, comment: item.dataValues.comment});
      });
      resolve(result);
    }, function(error) {
      reject(error);
    });
  });
}
