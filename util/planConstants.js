'use strict';
module.exports = {
  free: {
    sessionCount: 1,
    contactListCount: 1,
    surveyCount: 1,
    recruiterContactListCount: 1,
    importDatabase: true,
    brandLogoAndCustomColors: false,
    contactListMemberCount: -1,
    accountUserCount: 1,
    exportContactListAndParticipantHistory: false,
    exportRecruiterSurveyData: false,
    accessKlzziForum: true,
    accessKlzziFocus: true,
    canInviteObserversToSession: false,
    paiedSmsCount: 0,
    discussionGuideTips: true,
    whiteboardFunctionality: true,
    uploadToGallery: false,
    reportingFunctions: false,
    availableOnTabletAndMobilePlatforms: true,
    customEmailInvitationAndReminderMessages: true,
    topicCount: 1,
    priority: -10
  },
  single: {
    sessionCount: 1,
    contactListCount: 1,
    surveyCount: 1,
    additionalContactListCount: 0,
    contactListMemberCount: -1,
    participantCount: 8,
    observerCount: 15,
    paiedSmsCount: 50,
    priority: -10,

    recruiterContactListCount: 1,
    accountUserCount: 1,
    topicCount: -1
  },
  fixed_monthly: {
    sessionCount: 3,
    contactListCount: 1,
    surveyCount: 1,
    additionalContactListCount: 1,
    contactListMemberCount: -1,
    participantCount: 8,
    observerCount: 15,
    paiedSmsCount: 50,
    priority: -10,

    recruiterContactListCount: 1,
    accountUserCount: 1,
    topicCount: -1
  },
  fixed_yearly: {
    sessionCount: 3,
    contactListCount: 1,
    surveyCount: 1,
    additionalContactListCount: 1,
    contactListMemberCount: -1,
    participantCount: 8,
    observerCount: 15,
    paiedSmsCount: 50,
    priority: -10,

    recruiterContactListCount: 1,
    accountUserCount: 1,
    topicCount: -1
  },
  unlimited: {
    sessionCount: -1,
    contactListCount: -1,
    surveyCount: -1,
    additionalContactListCount: -1,
    contactListMemberCount: -1,
    participantCount: 8,
    observerCount: 15,
    paiedSmsCount: 600,
    priority: -10,

    recruiterContactListCount: 1,
    accountUserCount: 1,
    topicCount: -1
  },


  free_trial: {
    sessionCount: 1,
    contactListCount: 1,
    recruiterContactListCount: 1,
    importDatabase: true,
    brandLogoAndCustomColors: true,
    contactListMemberCount: -1,
    accountUserCount: 1,
    exportContactListAndParticipantHistory: false,
    exportRecruiterSurveyData: false,
    accessKlzziForum: true,
    accessKlzziFocus: true,
    canInviteObserversToSession: true,
    paiedSmsCount: 20,
    discussionGuideTips: true,
    whiteboardFunctionality: true,
    uploadToGallery: true,
    reportingFunctions: true,
    availableOnTabletAndMobilePlatforms: true,
    customEmailInvitationAndReminderMessages: true,
    topicCount: -1,
    priority: -1
  },
  free_account: {
    sessionCount: 1,
    contactListCount: 1,
    recruiterContactListCount: 1,
    importDatabase: true,
    brandLogoAndCustomColors: false,
    contactListMemberCount: -1,
    accountUserCount: 1,
    exportContactListAndParticipantHistory: false,
    exportRecruiterSurveyData: false,
    accessKlzziForum: true,
    accessKlzziFocus: true,
    canInviteObserversToSession: false,
    paiedSmsCount: 0,
    discussionGuideTips: true,
    whiteboardFunctionality: true,
    uploadToGallery: false,
    reportingFunctions: false,
    availableOnTabletAndMobilePlatforms: true,
    customEmailInvitationAndReminderMessages: true,
    topicCount: 5,
    priority: -1
  },
  senior_monthly: {
    sessionCount: 8,
    contactListCount: 4,
    recruiterContactListCount: 4,
    importDatabase: true,
    brandLogoAndCustomColors: true,
    contactListMemberCount: -1,
    accountUserCount: 5,
    exportContactListAndParticipantHistory: true,
    exportRecruiterSurveyData: true,
    accessKlzziForum: true,
    accessKlzziFocus: true,
    canInviteObserversToSession: true,
    paiedSmsCount: 75,
    discussionGuideTips: true,
    whiteboardFunctionality: true,
    uploadToGallery: true,
    reportingFunctions: true,
    availableOnTabletAndMobilePlatforms: true,
    customEmailInvitationAndReminderMessages: true,
    topicCount: -1,
    priority: 1,
    related: 'senior_yearly'
  },
  senior_yearly: {
    sessionCount: 8,
    contactListCount: 4,
    recruiterContactListCount: 4,
    importDatabase: true,
    brandLogoAndCustomColors: true,
    contactListMemberCount: -1,
    accountUserCount: 5,
    exportContactListAndParticipantHistory: true,
    exportRecruiterSurveyData: true,
    accessKlzziForum: true,
    accessKlzziFocus: true,
    canInviteObserversToSession: true,
    paiedSmsCount: 75,
    discussionGuideTips: true,
    whiteboardFunctionality: true,
    uploadToGallery: true,
    reportingFunctions: true,
    availableOnTabletAndMobilePlatforms: true,
    customEmailInvitationAndReminderMessages: true,
    topicCount: -1,
    priority: -1
  },
  core_monthly: {
    sessionCount: 3,
    contactListCount: 2,
    recruiterContactListCount: 2,
    importDatabase: true,
    brandLogoAndCustomColors: true,
    contactListMemberCount: -1,
    accountUserCount: 2,
    exportContactListAndParticipantHistory: true,
    exportRecruiterSurveyData: true,
    accessKlzziForum: true,
    accessKlzziFocus: true,
    canInviteObserversToSession: true,
    paiedSmsCount: 50,
    discussionGuideTips: true,
    whiteboardFunctionality: true,
    uploadToGallery: true,
    reportingFunctions: true,
    availableOnTabletAndMobilePlatforms: true,
    customEmailInvitationAndReminderMessages: true,
    topicCount: 20,
    priority: 2,
    related: 'core_yearly'
  },
  core_yearly: {
    sessionCount: 3,
    contactListCount: 2,
    recruiterContactListCount: 2,
    importDatabase: true,
    brandLogoAndCustomColors: true,
    contactListMemberCount: -1,
    accountUserCount: 2,
    exportContactListAndParticipantHistory: true,
    exportRecruiterSurveyData: true,
    accessKlzziForum: true,
    accessKlzziFocus: true,
    canInviteObserversToSession: true,
    paiedSmsCount: 50,
    discussionGuideTips: true,
    whiteboardFunctionality: true,
    uploadToGallery: true,
    reportingFunctions: true,
    availableOnTabletAndMobilePlatforms: true,
    customEmailInvitationAndReminderMessages: true,
    topicCount: 20,
    priority: -1
  },
  junior_monthly: {
    sessionCount: 1,
    contactListCount: 1,
    recruiterContactListCount: 1,
    importDatabase: true,
    brandLogoAndCustomColors: false,
    contactListMemberCount: -1,
    accountUserCount: 1,
    exportContactListAndParticipantHistory: false,
    exportRecruiterSurveyData: false,
    accessKlzziForum: true,
    accessKlzziFocus: true,
    canInviteObserversToSession: false,
    paiedSmsCount: 20,
    discussionGuideTips: true,
    whiteboardFunctionality: true,
    uploadToGallery: true,
    reportingFunctions: true,
    availableOnTabletAndMobilePlatforms: true,
    customEmailInvitationAndReminderMessages: true,
    topicCount: 5,
    priority: 3,
    related: 'junior_yearly'
  },
  junior_yearly: {
    sessionCount: 1,
    contactListCount: 1,
    recruiterContactListCount: 1,
    importDatabase: true,
    brandLogoAndCustomColors: false,
    contactListMemberCount: -1,
    accountUserCount: 1,
    exportContactListAndParticipantHistory: false,
    exportRecruiterSurveyData: false,
    accessKlzziForum: true,
    accessKlzziFocus: true,
    canInviteObserversToSession: false,
    paiedSmsCount: 20,
    discussionGuideTips: true,
    whiteboardFunctionality: true,
    uploadToGallery: true,
    reportingFunctions: true,
    availableOnTabletAndMobilePlatforms: true,
    customEmailInvitationAndReminderMessages: true,
    topicCount: 5,
    priority: -1
  }
}
