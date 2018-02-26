'use strict';
var _ = require('lodash');
let moment = require('moment');

const canAccountDatabase = (account, accountUser, sub) => {
    return(account.admin && checkRoles(accountUser.role, ['admin']))
}
const canAccountManagers = (account, accountUser, sub) => {
    return(checkRoles(accountUser.role, ['accountManager', 'admin']))
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
    // 22.05.2017 Chargebee is canceled!!! from 23.05.2017
    // return(!account.admin && checkRoles(accountUser.role, []))
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
    return(!!checkSub(account, accountUser, sub, 'planSmsCount'))
}
const canPaymentDetails = (account, accountUser, sub) => {
     // 22.05.2017 Chargebee is canceled!!! from 23.05.2017
    // return(checkRoles(accountUser.role, []))
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

const hasBoughtSessions = (account, accountUser, sub) => {
  return checkRoles(accountUser.role, ['admin']) || (_.some(sub.availableSessions, (s) => moment().isBefore(s.endDate)) || sub.sessionCount > 0);
};

const canCreateSocialForum = (account, accountUser, sub) => {
  return checkRoles(accountUser.role, ['admin']) || checkSub(account, accountUser, sub, 'accessKlzziSocialForum');
};

const canCreateFocus = (account, accountUser, sub) => {
  return checkRoles(accountUser.role, ['admin']) || checkSub(account, accountUser, sub, 'accessKlzziFocus');
};

const canCreateForum = (account, accountUser, sub) => {
  return checkRoles(accountUser.role, ['admin']) || checkSub(account, accountUser, sub, 'accessKlzziForum');
};


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
    hasBoughtSessions: hasBoughtSessions,
    canAccountProfile: canAccountProfile,
    canCreateSocialForum: canCreateSocialForum,
    canCreateFocus: canCreateFocus,
    canCreateForum: canCreateForum,
};

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
