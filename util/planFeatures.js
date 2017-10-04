'use strict';
module.exports = {
  features: [
    { key: "handsOnHelp",                               type: "Boolean",     title: "Hands-On Help"                   },
    { key: "accessKlzziSocialForum",                    type: "Boolean",     title: "Access Social Forum"             },
    { key: "sessionCount",                              type: "Number",      title: "# of Chat Sessions"              },
    { key: "contactListCount",                          type: "Number",      title: "# of Contact Lists"              }, //todo support for unlimited
    { key: "recruiterContactListCount",                 type: "Number",      title: "# of Recruiter Social/Surveys"   },
    { key: "exportRecruiterStats",                      type: "Boolean",     title: "Export Survey Recruiter Stats"   },
    { key: "exportRecruiterSurveyData",                 type: "Boolean",     title: "Export Survey Recruiter Data"    },
    { key: "exportContactListAndParticipantHistory",    type: "Boolean",     title: "Export Contacts"                 },
    { key: "numberOfContacts",                          type: "Number",      title: "# of Contacts"                   },
    { key: "accountUserCount",                          type: "Number",      title: "# of Managers"                   },
    { key: "brandLogoAndCustomColors",                  type: "Number",      title: "Custom Logo&Colors"              }, // todo support for number
    { key: "topicCount",                                type: "Number",      title: "# of Topics"                     },
    { key: "whiteboardDisplay",                         type: "Boolean",     title: "Whiteboard-Display"              },
    { key: "uploadToGallery",                           type: "Boolean",     title: "Multimedia"                      },
    { key: "voting",                                    type: "Boolean",     title: "Voting"                          },
    { key: "privateMessaging",                          type: "Boolean",     title: "Private Messaging"               },
    { key: "discussionGuideTips",                       type: "Boolean",     title: "Session Hosting Tips"            },
    { key: "reportingFunctions",                        type: "Boolean",     title: "Export Reporting"                },
    { key: "availableOnTabletAndMobilePlatforms",       type: "Boolean",     title: "Mobile&Tablet"                   },
    { key: "secureSsl",                                 type: "Boolean",     title: "Private&Secure (SSL)"            },

    // { key: "accessKlzziForum",                          type: "Boolean",     title: "Access klzii Forum"              },
    // { key: "accessKlzziFocus",                          type: "Boolean",     title: "Access klzii Focus"              },
    // { key: "importDatabase",                            type: "Boolean",     title: "Import&Map Contacts"             },
    // { key: "customEmailInvitationAndReminderMessages",  type: "Boolean",     title: "Custom Emails"                   },
    // { key: "planSmsCount",                              type: "NumberLimit", title: "SMS Alerts (Focus)"              },
    // { key: "canInviteObserversToSession",               type: "Boolean",     title: "Spectators"                      },
    // { key: "whiteboardFunctionality",                   type: "Boolean",     title: "Whiteboard-Interactive"          },
    // { key: "pinboardDisplay",                           type: "Boolean",     title: "Pinboard"                        },
  ]
};
