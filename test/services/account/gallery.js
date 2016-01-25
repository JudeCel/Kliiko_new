// "use strict";
// var models  = require('./../../../models');
// var user  = models.User;
// var account  = models.Account;
// var usersServices  = require('./../../../services/users');
// var gallery  = require('./../../../services/account/gallery');
// var assert = require('chai').assert;

// describe('Gallery', function() {
//   var testUser = null;
//   var testAccount = null;

//   beforeEach(function(done) {
//     var attrs = {
//       accountName: "BLauris",
//       firstName: "Lauris",
//       lastName: "Blīgzna",
//       password: "multipassword",
//       email: "bligzna.lauris@gmail.com",
//       gender: "male"
//     }

//     models.sequelize.sync({ force: true }).then(() => {
//       usersServices.create(attrs, function(errors, user) {
//         testUser = user;
//         user.getOwnerAccount().then(function(accounts) {
//           testAccount = accounts[0];
//           done();
//         });
//       });
//     });
//   });

//   afterEach(function(done) {
//     models.sequelize.sync({ force: true }).then(() => {
//       done();
//     });
//   });

//   it('finds all account gallery records', function (done) {
//     gallery.findAllRecords(testAccount.id).then(
//       function(res) {
//         assert.deepEqual(res, []);
//         done();
//       },
//       function(err) {
//         assert.equal(res, null);
//         done();
//       }
//     );
//   });

//   function defaultFile(params) {
//     let json = {};
//     json = {
//       originalname: params.originalname || 'profile_test.png',
//       encoding: params.encoding || '7bit',
//       mimetype: params.mimetype || 'image/png',
//       destination: params.destination || 'test/fixtures/uploadGallery/test',
//       filename: params.filename || 'success.png',
//       path: params.path || 'test/fixtures/uploadBanner/test/success.png',
//       size: params.size || 3000000
//     };
//     return json;
//   }


//   describe('success uploads', function() {
//     describe('image files', function() {
//       it.only('successfully uploads .png image for picture upload', function (done) {
//         let file = defaultFile({});
//         let params = {
//           uploadType: "image", 
//           file
//         }

//         gallery.uploadNew(params).then(
//           function(res) {
//             console.log(res)
//             done();
//           },
//           function(err) {
//             assert.deepEqual(err, null);
//             done();
//           }
//         );
//       });
//     });
//   });

//   describe('upload validations return correct errors', function() {

//     it('trying to upload to big file', function (done) {
//       let file = defaultFile({ size: 600000000 });
//       let params = {
//         uploadType: "image", 
//         file
//       }

//       gallery.uploadNew(params).then(
//         function(res) {
//           assert.deepEqual(res, null);
//           done();
//         },
//         function(err) {
//           assert.equal(err[0].errorMessage, 'This file is too big. Allowed size is 5MB.');
//           done();
//         }
//       );
//     });

//     it('trying to upload invalid image file', function (done) {
//       let file = defaultFile({ mimetype: "image/gif" });
//       let params = {
//         uploadType: "image", 
//         file
//       }

//       gallery.uploadNew(params).then(
//         function(res) {
//           assert.deepEqual(res, null);
//           done();
//         },
//         function(err) {
//           assert.equal(err[0].errorMessage, 'Only file extensions for image file are allowed - png, jpg, jpeg, bmp.');
//           done();
//         }
//       );
//     });

//     it('trying to upload invalid brand logo file', function (done) {
//       let file = defaultFile({ mimetype: "image/tiff" });
//       let params = {
//         uploadType: "brandLogo", 
//         file
//       }

//       gallery.uploadNew(params).then(
//         function(res) {
//           assert.deepEqual(res, null);
//           done();
//         },
//         function(err) {
//           assert.equal(err[0].errorMessage, 'Only file extensions for brand logo file are allowed - png, jpg, jpeg, bmp.');
//           done();
//         }
//       );
//     });

//     it('trying to upload invalid image file', function (done) {
//       let file = defaultFile({ mimetype: "audio/wav" });
//       let params = {
//         uploadType: "audio", 
//         file
//       }

//       gallery.uploadNew(params).then(
//         function(res) {
//           assert.deepEqual(res, null);
//           done();
//         },
//         function(err) {
//           assert.equal(err[0].errorMessage, 'Only file extensions for audio file are allowed - mp3.');
//           done();
//         }
//       );
//     });

//     it('trying to upload invalid text file', function (done) {
//       let file = defaultFile({ mimetype: "application/csv" });
//       let params = {
//         uploadType: "text", 
//         file
//       }

//       gallery.uploadNew(params).then(
//         function(res) {
//           assert.deepEqual(res, null);
//           done();
//         },
//         function(err) {
//           assert.equal(err[0].errorMessage, 'Only file extensions for text file are allowed - pdf.');
//           done();
//         }
//       );
//     });

//     it('trying to upload invalid video file', function (done) {
//       let file = defaultFile({ mimetype: "video/mkv" });
//       let params = {
//         uploadType: "video", 
//         file
//       }

//       gallery.uploadNew(params).then(
//         function(res) {
//           assert.deepEqual(res, null);
//           done();
//         },
//         function(err) {
//           assert.equal(err[0].errorMessage, 'Only file extensions for video file are allowed - ogg, webm, mp4.');
//           done();
//         }
//       );
//     });


//     it('trying to save invalid youtube URL', function (done) {
//       let params = {
//         uploadType: "video", 
//         url: "google.com"
//       }

//       gallery.uploadNew(params).then(
//         function(res) {
//           assert.deepEqual(res, null);
//           done();
//         },
//         function(err) {
//           assert.equal(err[0].errorMessage, "Video URL you provided is invalid, please double check your video it.");
//           done();
//         }
//       );
//     });

//   });

// });
