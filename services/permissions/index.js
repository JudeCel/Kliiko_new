'use strict';
var _ = require('lodash');
const canAccountDatabase = (account, accountUser) => {
    return(account.admin && checkRoles(accountUser.role, ['admin']))
}
const canAccountManagers = (_account, accountUser) => {
    return(checkRoles(accountUser.role, ['accountManager', 'admin']))
}
const canUpgradePlan = (account, accountUser) => {
    return(!account.admin && checkRoles(accountUser.role, ['accountManager', 'admin']))
}
const canSessionRating = (account, accountUser) => {
    return(account.admin && checkRoles(accountUser.role, ['admin']))
}
const canBannerMessages = (account, accountUser) => {
    return(account.admin && checkRoles(accountUser.role, ['admin']))
}
const canSystemMailTemplates = (account, accountUser) => {
    return(account.admin && checkRoles(accountUser.role, ['admin']))
}
const canSeeFreeTrialWarning = (account, accountUser) => {
    return(checkRoles(accountUser.role, ['accountManager']))
}

const permissionsObject = { 
    canAccountDatabase: canAccountDatabase,
    canAccountManagers: canAccountManagers,
    canUpgradePlan: canUpgradePlan,
    canSessionRating: canSessionRating,
    canSystemMailTemplates: canSystemMailTemplates,
    canBannerMessages: canBannerMessages,
    canSeeFreeTrialWarning: canSeeFreeTrialWarning
} 

const Bluebird = require('bluebird');
const forAccount = (account, accountUser)  => {
    return new Bluebird( (resolve, reject) => {
        let permissions = Object.assign({}, permissionsObject)
        Object.keys(permissions).map((i) => {
            permissions[i] = permissions[i](account, accountUser)
        })
        resolve(permissions);
    });
}


function checkRoles(role, allowedRoles) {
  return _.includes(allowedRoles, role);
}
module.exports = {
    forAccount: forAccount
};