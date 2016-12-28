(function () {
  'use strict';

  angular.module('KliikoApp.changesValidation', []).factory('changesValidation', changesValidationFactory);

  changesValidationFactory.$inject = ['$q', '$confirm'];
  function changesValidationFactory($q, $confirm) {


    var changesValidationService = {};
    changesValidationService.validationConfirm = validationConfirm;
    changesValidationService.validationConfirmAlternative = validationConfirmAlternative;
    return changesValidationService;

    function validationConfirm(res, saveAgainFunction, data, sessionModel) {
      var deferred = $q.defer();

      validationConfirmDialog(res.validation, function() {
        if (res.validation.fieldName) {
          data.snapshot[res.validation.fieldName] = res.validation.currentValueSnapshot;
        }
        if (res.validation.currentSnapshotChanges) {
          angular.merge(data.snapshot, res.validation.currentSnapshotChanges);
        }
        saveAgainFunction(data, sessionModel).then(function(newRes) {
          deferred.resolve(newRes);
        }, function(error) {
          deferred.reject(error);
        });
      }, function() {
        sessionModel.getRemoteData().then(function() {
          deferred.resolve({ ignored: true });
        }, function(error) {
          deferred.reject(error);
        });
      });

      return deferred.promise;
    }

    function validationConfirmAlternative(res, saveAgainFunction, data, optionalParamForSaveAgainFunction) {
      var deferred = $q.defer();

      validationConfirmDialog(res.validation, function() {
        if (res.validation.currentSnapshotChanges) {
          angular.merge(data.snapshot, res.validation.currentSnapshotChanges);
        }
        saveAgainFunction(data, optionalParamForSaveAgainFunction).then(function(newRes) {
          deferred.resolve(newRes);
        }, function(error) {
          deferred.reject(error);
        });
      }, function() {
        deferred.resolve({ ignored: true });
      });

      return deferred.promise;
    }

    function validationConfirmDialog(validation, saveMineCallback, saveTheirsCallback) {
      if (validation.canChange) {
        $confirm({ 
          text: validation.message, 
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
          text: validation.message, 
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
