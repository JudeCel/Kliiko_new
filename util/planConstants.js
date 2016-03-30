'use strict';
module.exports = {
  free: {
    sessionCount: 1,
    contactListCount: 1,
    surveyCount: 1,
    additionalContactListCount: 0,
    contactListMemberCount: -1,
    participantCount: 8,
    observerCount: 15,
    paidSmsCount: 50,
    priority: 1
  },
  single: {
    sessionCount: 1,
    contactListCount: 1,
    surveyCount: 1,
    additionalContactListCount: 0,
    contactListMemberCount: -1,
    participantCount: 8,
    observerCount: 15,
    paidSmsCount: 50,
    priority: 2
  },
  fixed_monthly: {
    sessionCount: 3,
    contactListCount: 1,
    surveyCount: 1,
    additionalContactListCount: 1,
    contactListMemberCount: -1,
    participantCount: 8,
    observerCount: 15,
    paidSmsCount: 50,
    priority: 3
  },
  fixed_yearly: {
    sessionCount: 3,
    contactListCount: 1,
    surveyCount: 1,
    additionalContactListCount: 1,
    contactListMemberCount: -1,
    participantCount: 8,
    observerCount: 15,
    paidSmsCount: 50,
    priority: 3
  },
  unlimited: {
    sessionCount: -1,
    contactListCount: 1,
    surveyCount: -1,
    additionalContactListCount: -1,
    contactListMemberCount: -1,
    participantCount: 8,
    observerCount: 15,
    paidSmsCount: 600,
    priority: 4
  }
}
