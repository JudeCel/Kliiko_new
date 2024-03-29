'use strict';
var accountUserService = require('../../services/accountUser');
var assert = require('chai').assert;

describe('SERVICE - AccountUser without DB', function() {
  describe("#recalculateRole", () => {
    describe("validations", () => {
      it("try both actions in same time", (done) =>{
        accountUserService.recalculateRole({}, "facilitator", "participant").then(() => {
          done("should not get here");
        }, (error) => {
          done();
        })
      })
      it("try invalide role", (done) =>{
        accountUserService.recalculateRole({}, "pufff2").then(() => {
          done("should not get here");
        }, (error) => {
          done();
        })
      })
    })
    describe("when remove role", () => {
      it("return highest role facilitator, current role not chenges", (done) => {

        let accountUser = {
          role: "accountManager",
          SessionMembers: [
            {role: 'facilitator'},
            {role: 'participant'},
            {role: 'participant'},
            {role: 'observer'},
            {role: 'observer'},
          ]
        }

        accountUserService.recalculateRole(accountUser, null, accountUser.role).then((result) => {
          try {
            assert.deepEqual(result, { role: "facilitator", active: true, isRemoved: true });
            done();
          } catch (e) {
            done(e);
          }
        })
      })

      it("return highest role participant, current role chenges", (done) => {
        let accountUser = {
          role: "accountManager",
          SessionMembers: [
            {role: 'participant'},
            {role: 'participant'},
            {role: 'observer'},
            {role: 'observer'},
          ]
        }

        accountUserService.recalculateRole(accountUser,null, accountUser.role).then((result) => {
          try {
            assert.deepEqual(result, { role: "participant", active: true, isRemoved: true });
            done();
          } catch (e) {
            done(e);
          }
        })
      })

      it("return highest role admin, current role not chenges", (done) => {
        let accountUser = {
          role: "admin",
          SessionMembers: [
            {role: 'participant'},
            {role: 'participant'},
            {role: 'observer'},
            {role: 'observer'},
          ]
        }

        accountUserService.recalculateRole(accountUser, null, 'accountManager').then((result) => {
          try {
            assert.deepEqual(result, { role: "admin", active: true, isRemoved: true });
            done();
          } catch (e) {
            done(e);
          }
        })
      })

      it("return highest role observer, current role chenges", (done) => {
        let accountUser = {
          role: "participant",
          SessionMembers: [
            {role: 'observer'},
            {role: 'observer'},
          ]
        }

        accountUserService.recalculateRole(accountUser, null, 'participant').then((result) => {
          try {
            assert.deepEqual(result, { role: "observer", active: true, isRemoved: false });
            done();
          } catch (e) {
            done(e);
          }
        })
      })

      it("return lowest role in system if no other roles", (done) => {
        let accountUser = {
          role: "participant",
          SessionMembers: []
        }

        accountUserService.recalculateRole(accountUser, null, 'participant').then((result) => {
          try {
            assert.deepEqual(result, { active: false, isRemoved: false });
            done();
          } catch (e) {
            done(e);
          }
        })
      })
    })

    describe("when no role given", () => {
      it("return highest role from accountManager", (done) => {
        let accountUser = {
          role: "participant",
          SessionMembers: [
            {role: 'facilitator'},
            {role: 'participant'},
            {role: 'observer'},
            {role: 'observer'},
          ]
        }

        accountUserService.recalculateRole(accountUser).then((result) => {
          try {
            assert.deepEqual(result, { role: "facilitator", active: true, isRemoved: false  });
            done();
          } catch (e) {
            done(e);
          }
        });
      });
    }),

    describe("when add new role", () => {
      it("return highest role accountManager, current role not chenges ", (done) => {
        let accountUser = {
          role: "accountManager",
          SessionMembers: [
            {role: 'participant'},
            {role: 'participant'},
            {role: 'observer'},
            {role: 'observer'},
          ]
        }

        accountUserService.recalculateRole(accountUser, "facilitator").then((result) => {
          try {
            assert.deepEqual(result, { role: "accountManager", active: true, isRemoved: false  });
            done();
          } catch (e) {
            done(e);
          }
        });
      });

      it("return highest role facilitator, current role chenges ", (done) => {
        let accountUser = {
          role: "participant",
          SessionMembers: [
            {role: 'participant'},
            {role: 'participant'},
            {role: 'observer'},
            {role: 'observer'},
          ]
        }

        accountUserService.recalculateRole(accountUser, "facilitator").then((result) => {
          try {
            assert.deepEqual(result, { role: "facilitator", active: true, isRemoved: false });
            done();
          } catch (e) {
            done(e);
          }
        });
      });
    });
  });
})
