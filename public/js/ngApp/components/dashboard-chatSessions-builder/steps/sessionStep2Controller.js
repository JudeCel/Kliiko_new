(function () {
  'use strict';

  angular.module('KliikoApp').controller('SessionStep2Controller', SessionStep2Controller);

  SessionStep2Controller.$inject = ['dbg', 'sessionBuilderControllerServices', 'messenger', 'orderByFilter', '$anchorScroll', '$location', '$scope', '$confirm', 'domServices', '$sce'];
  function SessionStep2Controller(dbg, sessionBuilderControllerServices, messenger, orderByFilter, $anchorScroll, $location, $scope, $confirm, domServices, $sce) {
    dbg.log2('#SessionBuilderController 2 started');

    var vm = this;
    var landingSign = "Click to access Topics";

    vm.allTopicsSelected = false;
    vm.sessionTopicsArray = [];
    vm.sessionTopicsObject = {};
    vm.isDropsectionInViewport = true;
    vm.isDragInProgress = false;

    vm.sortableOptionsA = {
      stop: function(e, ui) {
        reOrderTopics();
        saveTopics(vm.sessionTopicsArray);
      }
    };

    vm.init = init;
    vm.canDragElement = canDragElement;
    vm.selectAllTopics = selectAllTopics;
    vm.closeModal = closeModal;
    vm.removeTopicFromList = removeTopicFromList;
    vm.topicsOnDropComplete = topicsOnDropComplete;
    vm.changeActiveState = changeActiveState;
    vm.changeLandingState = changeLandingState;
    vm.onDragEnd = onDragEnd;
    vm.onDragStart = onDragStart;
    vm.canBeDraggedAsMultiple = canBeDraggedAsMultiple;
    vm.getTopicStockClass = getTopicStockClass;
    vm.isCopy = isCopy;
    vm.surveyList = [];
    vm.surveyEditors = [];
    vm.attachedSurveysToSession = {};
    vm.inviteAgainTopicAdded = inviteAgainTopicAdded;

    function surveyWithType(surveyType) {
      if (vm.session.steps.step2.surveys && vm.session.steps.step2.surveys.length) {
        for (var i=0; i<vm.session.steps.step2.surveys.length; i++) {
          if (vm.session.steps.step2.surveys[i].surveyType == surveyType) {
            return vm.session.steps.step2.surveys[i];
          }
        }
      }
      return null;
    }

    function initContactListSurvey() {
      var survey = surveyWithType('sessionContactList');
      var surveySection = surveyBasicSectionData();
      surveySection.surveyType = 'sessionContactList';
      surveySection.active = survey && survey.active;
      surveySection.title = "Contact List Questions";
      surveySection.canDisable = !vm.session.publicUid;;
      if (survey) {
        surveySection.id = survey.surveyId;
        vm.attachedSurveysToSession[surveySection.id] = true;
      }
      return surveySection;
    }

    function initPrizeDrawSurvey() {
      var survey = surveyWithType('sessionPrizeDraw');
      var surveySection = surveyBasicSectionData();
      surveySection.surveyType = 'sessionPrizeDraw';
      surveySection.title = "Prize Draw";
      surveySection.canDisable = !vm.session.publicUid;
      surveySection.active = survey && survey.active;

      if (survey) {
        surveySection.id = survey.surveyId;
        vm.attachedSurveysToSession[surveySection.id] = true;
      }
      return surveySection;
    }

    function surveyBasicSectionData() {
      return {
        defaultSurveyName: vm.session.steps.step1.name,
        onSaved: vm.onSurveySaved,
        showSaveButton: false,
        showPublishButton: false,
        showPreviewButton: false,
        disableMessages: true
      }
    }

    vm.checkCanSaveSurveys = function() {
      return !vm.session.publicUid && vm.inviteAgainTopicAdded();
    }

    function initSurveys() {
      var listSurvey = initContactListSurvey();
      var prizeSurvey = initPrizeDrawSurvey();
      vm.surveyList = [listSurvey, prizeSurvey];
    }

    function init(topicController) {
      vm.session = sessionBuilderControllerServices.session;
      vm.topics = vm.session.steps.step2.topics;
      vm.topicController = topicController;
      vm.topicController.session = vm.session;
      vm.topicController.resetSessionTopics = vm.init;
      vm.topicController.init();

      vm.topics.map(function(topic) {
        addSessionTopic(topic);
      });
      vm.sessionTopicsArray = orderByFilter(vm.sessionTopicsArray, "sessionTopic.order");
      initSurveys();
    }

    vm.onSurveySaved = function(surveyId) {
      if (!vm.attachedSurveysToSession[surveyId]) {
        vm.session.addSurveyToSession(surveyId).then(function(result) {
          vm.attachedSurveysToSession[surveyId] = true;
        });
      }
    }

    function addSessionTopic(topic) {
      if (topic.SessionTopics[0]) {
        var exists = vm.sessionTopicsObject[topic.id];
        vm.sessionTopicsObject[topic.id] = topic;
        vm.sessionTopicsObject[topic.id].sessionTopic = topic.SessionTopics[0];
        if (!exists) {
          vm.sessionTopicsArray.push(vm.sessionTopicsObject[topic.id]);
        }
        vm.sessionTopicsArray = vm.sessionTopicsArray.map(function(item) {
          if (topic.id == item.id) {
            return topic;
          } else {
            return item;
          }
        });
      }
    }

    function canDragElement(topic) {
      var can = false, selected = getSelectedTopics();

      if (topic.stock || topic.default) {
        return false;
      }

      if (topic.inviteAgain && vm.session.publicUid) {
        return false;
      }

      if(!selected.length) {
        return true;
      }

      return isSelectedTopic(selected, topic);
    }

    function canBeDraggedAsMultiple(topic) {
      return isSelectedTopic(getSelectedTopics(), topic);
    }

    function isSelectedTopic(selectedTopics, currentTopic) {
      for(var i in selectedTopics) {
        if(selectedTopics[i].id == currentTopic.id) {
          return true;
        }
      }

      return false;
    }

    function isCopy(topic){
      if(topic.parentTopicId){
        return "Copy of ";
      }
    }

    function selectAllTopics(list) {
      vm.allTopicsSelected = !vm.allTopicsSelected;
      list.map(function(topic) {
        topic._selected = vm.allTopicsSelected && !topic.stock && !topic.default;
      });
    }

    function changeActiveState(topic) {
      topic.sessionTopic.active = !topic.sessionTopic.active;
      vm.session.canChangeTopicActive(!topic.sessionTopic.active).then(function(res) {
        if (topic.default && !topic.sessionTopic.active && topic.sessionTopic.landing) {
          for(var i=0; i<vm.sessionTopicsArray.length; i++) {
            if (vm.sessionTopicsArray[i].sessionTopic.active) {
              changeLandingState(vm.sessionTopicsArray[i]);
              return;
            }
          }
        }
        topic.sessionTopic.active = !topic.sessionTopic.active;
        saveTopics(vm.sessionTopicsArray);
      }, function() {
        domServices.modal('topicCantShow');
      });
    }

    function closeModal() {
      domServices.modal('topicCantShow', true);
    }

    function changeLandingState(topic) {
      vm.sessionTopicsArray.map(function(t) {
        if (t.sessionTopic.landing) {
          t.sessionTopic.landing = false;
          if (landingSign == t.sessionTopic.sign) {
            t.sessionTopic.sign = t.sessionTopic.lastSign;
            t.sessionTopic.lastSign = null;
          }
        }
      });

      setLanding(topic);
      saveTopics(vm.sessionTopicsArray);
    }

    function removeTopicFromList(id) {
      for(var index in vm.sessionTopicsArray) {
        var topic = vm.sessionTopicsArray[index];
        if (topic.id == id) {
          if (topic.inviteAgain) {
            if (!vm.session.publicUid) {
              $confirm({
                text: "By deleting this Topic you will not be able to Generate a Contact List. You can however reactivate by dragging from the left-hand column before publishing your Session."
              }).then(function() {
                removeTopicFromListConfirmed(id);
              });
            }
          } else {
            removeTopicFromListConfirmed(id);
          }
          break;
        }
      }
    }

    function removeTopicFromListConfirmed(id) {
      vm.session.removeTopic(id).then(function(res) {
        dbg.log2('topic removed');
        removeTopicFromLocalList(id);
      }, function(error) {
        messenger.error(error);
      });
    }

    function topicsOnDropComplete(dragTopic) {
      var list = [];
      var selected = getSelectedTopics();
      var flags = {
        inviteAgainTopicMessage: false
      };

      if (selected.length) {
        selected.map(function(topic) {
          addTopics(topic, list, flags);
        });
      } else {
        addTopics(dragTopic, list, flags);
      }

      if (list.length) {
        if(!findLandingTopic()) {
          setLanding(list[0]);
        }
        saveTopics(list);
      }
    }

    function setLanding(item) {
      item.sessionTopic.landing = true;
      item.sessionTopic.lastSign = item.sessionTopic.sign;
      item.sessionTopic.sign = landingSign;
    }

    function findLandingTopic() {
      for(var i in vm.sessionTopicsArray) {
        if(vm.sessionTopicsArray[i].sessionTopic.landing) {
          return vm.sessionTopicsArray[i];
        }
      }
      return false;
    }

    function saveTopics(list) {
      vm.session.saveTopics(list).then(function(result) {
        if (result.ignored) {
          init(vm.topicController);
        } else {
          orderByFilter(result.data, "id").map(function(topic) {
            addSessionTopic(topic);
          });
          vm.sessionTopicsArray = orderByFilter(vm.sessionTopicsArray, "sessionTopic.order");
          if (result.message) {
            var isHtml = result.message.indexOf("<") != -1;
            $confirm({ text: result.message, htmlText: isHtml ? $sce.trustAsHtml(result.message) : null, closeOnly: true, title: null });
          }
        }
      }, function(error) {
        messenger.error(error);
      });
    }

    function removeTopicFromLocalList(id) {
      var deletedLanding, found;
      vm.sessionTopicsArray.map(function(topic, index) {
        if(topic.id == id) {
          found = index;
          deletedLanding = topic.sessionTopic.landing;
          delete vm.sessionTopicsObject[topic.id];
          vm.sessionTopicsArray.splice(found, 1);
          reOrderTopics();
        }
      });

      if(deletedLanding && vm.sessionTopicsArray[0]) {
        changeLandingState(vm.sessionTopicsArray[0]);
      }
    }

    function inviteAgainTopicAdded(list) {
      for (var index in vm.sessionTopicsArray) {
        if (vm.sessionTopicsArray[index].inviteAgain) {
          return true;
        }
      }
      if (list) {
        for (var index in list) {
          if (list[index].inviteAgain) {
            return true;
          }
        }
      }
      return false;
    }

    function addTopics(topic, list, flags) {
      if (topic.inviteAgain && inviteAgainTopicAdded(list)) {
        if (!flags.inviteAgainTopicMessage) {
          flags.inviteAgainTopicMessage = true;
          $confirm({ text: "You can only have one of this type of Topics as active", closeOnly: true, title: null });
        }
        return;
      }

      if (!vm.sessionTopicsObject[topic.id]) {
        topic.sessionTopic = {
          order: vm.sessionTopicsArray.length,
          active: true,
          landing: false,
          name: topic.name,
          boardMessage: topic.boardMessage,
          sign: topic.sign,
          lastSign: null
        }
        if (list) {
          list.push(topic);
        }
      }
    }

    function reOrderTopics() {
      vm.sessionTopicsArray.map(function(topic, index) {
        topic.sessionTopic.order = index;
      });
    }

    function getSelectedTopics() {
      var array = [];
      vm.topicController.list.map(function(topic) {
        if(topic._selected) { array.push(topic); }
      });
      return array;
    }

    function onDragEnd() {
      vm.isDragInProgress = false;
    }

    function onDragStart() {
      scrollToDropSection();
      vm.isDragInProgress = true;
    }

    function scrollToDropSection() {
      if (!vm.isDropsectionInViewport) {
        $location.hash('drop-section');
        $anchorScroll();
      }
    }

    function getTopicStockClass(topic) {
      var wrap = topic.name === "It's A Wrap";
      var className = 'topic-list-item topic-'
      var stockClass = (topic.stock || topic.default ? 'stock' : 'not-stock')
      var wrapClass = wrap ? ' is-wrap-topic' : '';
      return className + stockClass + wrapClass;
    }

    vm.addEditorController = function(sc) {
      vm.surveyEditors.push(sc);
      if (vm.session.publicUid) {
        sc.disableEdit();
      }
    }

    vm.saveSurveys = function(autoSave, publish) {
      if (publish) {
        $confirm({ text: "When you Publish you will NOT be able to change the Contact List and Prize Draw Questions." }).then(function() {
          saveSurveysConfirmed(false, publish);
        });
      } else {
        saveSurveysConfirmed(autoSave, false);
      }
    }

    function saveSurveysConfirmed(autoSave, publish) {
      if (inviteAgainTopicAdded()) {
        vm.surveyEditors[0].survey.resourceId = vm.session.sessionData.resourceId;
        vm.surveyEditors[1].survey.resourceId = vm.session.sessionData.resourceId;
        vm.surveyEditors[0].survey.name = vm.session.steps.step1.name;
        vm.surveyEditors[1].survey.name = vm.session.steps.step1.name;

        vm.surveyEditors[0].saveSurvey(autoSave, publish, true).then(function() {
          vm.surveyEditors[1].saveSurvey(autoSave, publish, true).then(function() {
            if (publish) {
              publishSession();
            } else if (!autoSave) {
              openSessionsListAndHighlight();
            }
          }, function(e) {
            if (e) messenger.error(e);
          });
        }, function(e) {
          if (e) messenger.error(e);
        });
      } else {
        publishSession();
      }
    }

    function publishSession() {
      sessionBuilderControllerServices.publish(vm.session.id).then(function(res) {
        if (res.error) {
          messenger.error(res.error);
        } else {
          openSessionsListAndHighlight();
        }
      });
    }

    function openSessionsListAndHighlight() {
      location.href = "#/chatSessions?highlight=" + vm.session.id;
      messenger.ok('Successfully updated session!');
    }

    function copyInviteAgainTopic() {
      const inviteAgainTopicTemplate = vm.topicController.list.find(t => t.inviteAgain);
      // select inviteAgain topic
      angular.copy(inviteAgainTopicTemplate, vm.topicController.topicData);
      // create copy of selected topic based on template
      return vm.topicController.editTopic()
        .then(() => {
          // get an inviteAgain topic that is not in stock
          return vm.topicController.list.find(t => t.inviteAgain && !t.stock);
        });
    }

    function addInviteAgainTopic() {
      // check if there is an inviteAgain topic that is not in stock
      let inviteAgainTopic = vm.topicController.list.find(t => t.inviteAgain && !t.stock);
      if (inviteAgainTopic) {
        // add inviteAgain topic into session topics
        return topicsOnDropComplete(inviteAgainTopic);
      }
      // there is no topic - create a copy
      copyInviteAgainTopic()
        .then((inviteAgainTopic) => {
          // add inviteAgain topic into session topics
          topicsOnDropComplete(inviteAgainTopic);
        });
    }

    vm.blockSurvey = function(survey) {
      const active = !survey.active;
      vm.session
        .setSurveyEnabled(survey.id, active)
        .then(() => {
          survey.active = active;
          survey.expanded = active;

          // whether user enabled or disabled a survey, "active===true" means "user enabled a survey"
          if (active) {
            const alreadyAdded = inviteAgainTopicAdded();
            if (alreadyAdded) {
              return;
            }
            addInviteAgainTopic();
          } else {
            // check whether all surveys disabled
            const allDisabled = vm.surveyList.map(survey => survey.active).every(el => !el);
            if (allDisabled) {
              // get inviteAgain topic from list of session topics
              const inviteAgainTopicTemplate = vm.sessionTopicsArray.find(t => t.inviteAgain);
              // remove inviteAgain topic from session
              inviteAgainTopicTemplate && removeTopicFromListConfirmed(inviteAgainTopicTemplate.id);
            }
          }

        })
        .catch((error) => {
          messenger.error(error);
        });
    };

    vm.initSurveyEditor = function(sessionEditor, galeryController, survey) {
      survey.notPublished == !vm.session.publicUid;
      sessionEditor.initGallery(galeryController);
      sessionEditor.init(survey.id, survey);
      sessionEditor.initAutoSave(true);
      vm.addEditorController(sessionEditor);
    }
  }

})();
