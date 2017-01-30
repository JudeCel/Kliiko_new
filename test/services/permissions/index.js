'use strict';

var assert = require('chai').assert;
var PermissionsService = require('./../../../services/permissions');

describe('SERVICE - permissions', () => {
    describe("Admin in admin account", () => {
        var permisssions = {}
        before((done) => {
            var account =  {admin: true}
            var accountUser = {role: 'admin'}
            var sub = {uploadToGallery: true}
            PermissionsService.forAccount(account, accountUser, sub).then((result) => {
                permisssions = result;
                done();
            })
        });
        
        it("canAccountDatabase", () => {assert.equal(permisssions.canAccountDatabase, true)});
        it("canAccountManagers", () => {assert.equal(permisssions.canAccountManagers, true)});
        it("canUpgradePlan", () => {assert.equal(permisssions.canUpgradePlan, false)});
        it("canSessionRating", () => {assert.equal(permisssions.canSessionRating, true)});
        it("canSystemMailTemplates", () => {assert.equal(permisssions.canSystemMailTemplates, true)});
        it("canSeeFreeTrialWarning", () => {assert.equal(permisssions.canSeeFreeTrialWarning, false)});
        it("canSmsCredits", () => {assert.equal(permisssions.canSmsCredits, false)});
        it("canPaymentDetails", () => {assert.equal(permisssions.canPaymentDetails, false)});
        it("canStockCreateTopics", () => {assert.equal(permisssions.canStockCreateTopics, true)});
        it("canUploadBanners", () => {assert.equal(permisssions.canUploadBanners, true)});
        it("canCreateNewSession", () => {assert.equal(permisssions.canCreateNewSession, true)});
        it("canEditSession", () => {assert.equal(permisssions.canEditSession, true)});
        it("canSeeChatSessions", () => {assert.equal(permisssions.canSeeChatSessions, true)});
        it("canSeeChatSessions", () => {assert.equal(permisssions.canSeeChatSessions, true)});
        it("canUploadToGallery", () => {assert.equal(permisssions.canUploadToGallery, true)});
    });

    describe("Admin in regular account", () => {
        var permisssions = {}
        before((done) => {
            var account =  {admin: false}
            var accountUser = {role: 'admin'}
            var sub = {uploadToGallery: true}
            PermissionsService.forAccount(account, accountUser, sub).then((result) => {
                permisssions = result;
                done();
            })
        });
        it("canAccountDatabase", () => {assert.equal(permisssions.canAccountDatabase, false)});
        it("canAccountManagers", () => {assert.equal(permisssions.canAccountManagers, true)});
        it("canUpgradePlan", () => {assert.equal(permisssions.canUpgradePlan, true)});
        it("canSessionRating", () => {assert.equal(permisssions.canSessionRating, false)});
        it("canSystemMailTemplates", () => {assert.equal(permisssions.canSystemMailTemplates, false)});
        it("canSeeFreeTrialWarning", () => {assert.equal(permisssions.canSeeFreeTrialWarning, false)});
        it("canSmsCredits", () => {assert.equal(permisssions.canSmsCredits, false)});
        it("canPaymentDetails", () => {assert.equal(permisssions.canPaymentDetails, false)});
        it("canStockCreateTopics", () => {assert.equal(permisssions.canStockCreateTopics, false)});
        it("canUploadBanners", () => {assert.equal(permisssions.canUploadBanners, false)});
        it("canCreateNewSession", () => {assert.equal(permisssions.canCreateNewSession, true)});
        it("canEditSession", () => {assert.equal(permisssions.canEditSession, true)});
        it("canSeeChatSessions", () => {assert.equal(permisssions.canSeeChatSessions, true)});
        it("canUploadToGallery", () => {assert.equal(permisssions.canUploadToGallery, true)});
    });

    describe("Account Manager in regular account", () => {
        var permisssions = {}
        before((done) => {
            var account =  {admin: false}
            var accountUser = {role: 'accountManager'}
            var sub = {uploadToGallery: true}
            PermissionsService.forAccount(account, accountUser, sub).then((result) => {
                permisssions = result;
                done();
            })
        });

        it("canAccountDatabase", () => {assert.equal(permisssions.canAccountDatabase, false)});
        it("canAccountManagers", () => {assert.equal(permisssions.canAccountManagers, true)});
        it("canUpgradePlan", () => {assert.equal(permisssions.canUpgradePlan, true)});
        it("canSessionRating", () => {assert.equal(permisssions.canSessionRating, false)});
        it("canSystemMailTemplates", () => {assert.equal(permisssions.canSystemMailTemplates, false)});
        it("canSeeFreeTrialWarning", () => {assert.equal(permisssions.canSeeFreeTrialWarning, true)});
        it("canSmsCredits", () => {assert.equal(permisssions.canSmsCredits, true)});
        it("canPaymentDetails", () => {assert.equal(permisssions.canPaymentDetails, true)});
        it("canStockCreateTopics", () => {assert.equal(permisssions.canStockCreateTopics, false)});
        it("canUploadBanners", () => {assert.equal(permisssions.canUploadBanners, false)});
        it("canCreateNewSession", () => {assert.equal(permisssions.canCreateNewSession, true)});
        it("canEditSession", () => {assert.equal(permisssions.canEditSession, true)});
        it("canSeeChatSessions", () => {assert.equal(permisssions.canSeeChatSessions, true)});
        it("canUploadToGallery", () => {assert.equal(permisssions.canUploadToGallery, true)});
    });

    describe("Host in regular account", () => {
        var permisssions = {}
        before((done) => {
            var account =  {admin: false}
            var accountUser = {role: 'facilitator'}
            var sub = {uploadToGallery: true}
            PermissionsService.forAccount(account, accountUser, sub).then((result) => {
                permisssions = result;
                done();
            })
        });

        it("canAccountDatabase", () => {assert.equal(permisssions.canAccountDatabase, false)});
        it("canAccountManagers", () => {assert.equal(permisssions.canAccountManagers, false)});
        it("canUpgradePlan", () => {assert.equal(permisssions.canUpgradePlan, false)});
        it("canSessionRating", () => {assert.equal(permisssions.canSessionRating, false)});
        it("canSystemMailTemplates", () => {assert.equal(permisssions.canSystemMailTemplates, false)});
        it("canSeeFreeTrialWarning", () => {assert.equal(permisssions.canSeeFreeTrialWarning, false)});
        it("canSmsCredits", () => {assert.equal(permisssions.canSmsCredits, false)});
        it("canPaymentDetails", () => {assert.equal(permisssions.canPaymentDetails, false)});
        it("canStockCreateTopics", () => {assert.equal(permisssions.canStockCreateTopics, false)});
        it("canUploadBanners", () => {assert.equal(permisssions.canUploadBanners, false)});
        it("canCreateNewSession", () => {assert.equal(permisssions.canCreateNewSession, false)});
        it("canEditSession", () => {assert.equal(permisssions.canEditSession, true)});
        it("canSeeChatSessions", () => {assert.equal(permisssions.canSeeChatSessions, true)});
        it("canUploadToGallery", () => {assert.equal(permisssions.canUploadToGallery, false)});
    });
});