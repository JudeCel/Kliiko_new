'use strict';
var _ = require('lodash');
const canAccountDatabase = (account, accountUser, sub) => {
    return(account.admin && checkRoles(accountUser.role, ['admin']))
}
const canAccountManagers = (account, accountUser, sub) => {
    return(!account.admin && checkRoles(accountUser.role, ['accountManager', 'admin']))
}
const canAccountProfile = (_account, accountUser, sub) => {
    return(checkRoles(accountUser.role, ['accountManager', 'admin']))
}
const canCreateNewSession = (_account, accountUser, sub) => {
    return(checkRoles(accountUser.role, ['accountManager', 'admin']))
}
const canEditSession = (_account, accountUser, sub) => {
    return(checkRoles(accountUser.role, ['accountManager', 'admin', 'facilitator']))
}
const canSeeChatSessions = (_account, accountUser, sub) => {
    return(checkRoles(accountUser.role, ['accountManager', 'admin', 'facilitator']))
}
const canUpgradePlan = (account, accountUser, sub) => {
    return(!account.admin && checkRoles(accountUser.role, ['accountManager', 'admin']))
}
const canSessionRating = (account, accountUser, sub) => {
    return(account.admin && checkRoles(accountUser.role, ['admin']))
}
const canSystemMailTemplates = (account, accountUser, sub) => {
    return(account.admin && checkRoles(accountUser.role, ['admin']))
}
const canSeeFreeTrialWarning = (account, accountUser, sub) => {
    return(checkRoles(accountUser.role, ['accountManager']))
}
const canSmsCredits = (account, accountUser, sub) => {
    return(checkRoles(accountUser.role, ['accountManager']))
}
const canPaymentDetails = (account, accountUser, sub) => {
    return(checkRoles(accountUser.role, ['accountManager']))
}
const canStockCreateTopics = (account, accountUser, sub) => {
    return(account.admin && checkRoles(accountUser.role, ['admin']))
}
const canUploadBanners = (account, accountUser, sub) => {
    return(account.admin && checkRoles(accountUser.role, ['admin']))
}
const canUploadToGallery = (account, accountUser, sub) => {
    return(checkRoles(accountUser.role, ['admin', 'accountManager', 'facilitator']) && checkSub(account, accountUser, sub, 'uploadToGallery'))
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
    canUploadToGallery: canUploadToGallery,
    canAccountProfile: canAccountProfile
} 

const Bluebird = require('bluebird');
const forAccount = (account, accountUser, sub)  => {
    return new Bluebird( (resolve, reject) => {
        try {
            let permissions = Object.assign({}, permissionsObject)
            Object.keys(permissions).map((i) => {
                permissions[i] = permissions[i](account, accountUser, sub)
            })
            resolve(permissions);
        } catch (error) {
            reject(error);
        }

    });
}


function checkRoles(role, allowedRoles) {
  return _.includes(allowedRoles, role);
}
function checkSub(account, acountUser, sub, key) {
  if(acountUser.role == 'admin' || account.admin){
      return true;
  }else{
    return sub[key]
  }
}
module.exports = {
    forAccount: forAccount
};