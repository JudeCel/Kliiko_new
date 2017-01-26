'use strict';
var _ = require('lodash');
const canAccountDatabase = (account, accountUser) => {
    return(account.admin && checkRoles(accountUser.role, ['admin']))
}
const canAccountManagers = (_account, accountUser) => {
    return(checkRoles(accountUser.role, ['accountManager', 'admin']))
}
const canCreateNewSession = (_account, accountUser) => {
    return(checkRoles(accountUser.role, ['accountManager', 'admin']))
}
const canEditSession = (_account, accountUser) => {
    return(checkRoles(accountUser.role, ['accountManager', 'admin', 'facilitator']))
}
const canSeeChatSessions = (_account, accountUser) => {
    return(checkRoles(accountUser.role, ['accountManager', 'admin', 'facilitator']))
}
const canUpgradePlan = (account, accountUser) => {
    return(!account.admin && checkRoles(accountUser.role, ['accountManager', 'admin']))
}
const canSessionRating = (account, accountUser) => {
    return(account.admin && checkRoles(accountUser.role, ['admin']))
}
const canSystemMailTemplates = (account, accountUser) => {
    return(account.admin && checkRoles(accountUser.role, ['admin']))
}
const canSeeFreeTrialWarning = (account, accountUser) => {
    return(checkRoles(accountUser.role, ['accountManager']))
}
const canSmsCredits = (account, accountUser) => {
    return(checkRoles(accountUser.role, ['accountManager']))
}
const canPaymentDetails = (account, accountUser) => {
    return(checkRoles(accountUser.role, ['accountManager']))
}
const canStockCreateTopics = (account, accountUser) => {
    return(account.admin && checkRoles(accountUser.role, ['admin']))
}
const canUploadBanners = (account, accountUser) => {
    return(account.admin && checkRoles(accountUser.role, ['admin']))
}

const permissionsObject = { 
    canAccountDatabase: canAccountDatabase,
    canAccountManagers: canAccountManagers,
    canUpgradePlan: canUpgradePlan,
    canSessionRating: canSessionRating,
    canSystemMailTemplates: canSystemMailTemplates,
    canSeeFreeTrialWarning: canSeeFreeTrialWarning,
    canSmsCredits: canSmsCredits,
    canPaymentDetails: canPaymentDetails,
    canStockCreateTopics: canStockCreateTopics,
    canUploadBanners: canUploadBanners,
    canCreateNewSession: canCreateNewSession,
    canEditSession: canEditSession,
    canSeeChatSessions: canSeeChatSessions,
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