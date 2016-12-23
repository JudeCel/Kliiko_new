(function () {
  'use strict';

  angular.module('KliikoApp.changesValidation', []).factory('changesValidation', changesValidationFactory);

  changesValidationFactory.$inject = ['$q', '$confirm'];
  function changesValidationFactory($q, $confirm) {


    var changesValidationService = {};
    changesValidationService.validationConfirm = validationConfirm;
    changesValidationService.validationConfirmAlternative = validationConfirmAlternative;
    return changesValidationService;

    function validationConfirm(res, saveAgainCallback, data, sessionModel) {
      var deferred = $q.defer();

      validationConfirmDialog(res.validation, function() {
        if (res.validation.fieldName) {
          data.snapshot[res.validation.fieldName] = res.validation.currentValueSnapshot;
        }
        if (res.validation.currentSnapshotChanges) {
          angular.merge(data.snapshot, res.validation.currentSnapshotChanges);
        }
        saveAgainCallback(data, sessionModel).then(function(newRes) {
          deferred.resolve(newRes);
        });
      }, function() {
        sessionModel.getRemoteData().then(function() {
          deferred.resolve({ ignored: true });
        });
      });

      return deferred.promise;
    }

    function validationConfirmAlternative(res, saveAgainCallback, data, param1) {
      var deferred = $q.defer();
console.log(res);
      validationConfirmDialog(res.validation, function() {
        if (res.validation.currentSnapshotChanges) {
          angular.merge(data.snapshot, res.validation.currentSnapshotChanges);
        }
        saveAgainCallback(data, param1).then(function(newRes) {
          deferred.resolve(newRes);
        });
      }, function() {
        deferred.resolve({ ignored: true });
      });

      return deferred.promise;
    }

    function validationConfirmDialog(validation, saveMineCallback, saveTheirsCallback) {
      if (validation.canChange) {
        $confirm({ 
          text: "What are the odds of you and someone else editing the same thing at the same time... so which edit do you want saved?", 
          title: "Yikes!", 
          cancel: "Save Theirs", 
          ok: "Save Mine",
          choice: true, 
        }).then(function() {
          saveMineCallback();
        }, function() {
          saveTheirsCallback();
        });
      } else {
        $confirm({ 
          text: "Sorry, you can not change this option anymore, because it was already changed by someone else.", 
          title: "Yikes!", 
          closeOnly: true 
        }).then(function() {
          saveTheirsCallback();
        }, function() {
          saveTheirsCallback();
        });
      }
    }

  }
})();
