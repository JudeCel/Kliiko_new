'use strict';
module.exports = {

  focus: {
    steps: {
      setUp: {
        enabled: true,
        socialMediaGraphics: false
      }, 
      facilitatiorAndTopics: {
        enabled: true,
        survays: false
      }, 
      manageSessionEmails: {
        enabled: true
      },
      manageSessionParticipants: {
        enabled: true,
        sendGroupSms: true
      }, 
      inviteSessionObservers: {
        enabled: true,
        sendGroupSms: false
      }
    },
    features: {
      survay: {
        prizeDraw: {
          enabled: false
        },
        contactList: {
          enabled: false
        },
      },
      unidentifiedParticipants: {
        enabled: false
      },
      whiteboard: {
        enabled: true,
        canWrite: ['facilitator', 'participant']
      },
      pinboard: {
        enabled: true
      },
      sendSms: {
        enabled: true
      },
      closeSession: {
        enabled: true
      },
      dateAndTime: {
        enabled: true
      },
      anonymous: {
        enabled: true
      },
      colorScheme: {
        type: "focus"
      }
    },
    validations: {
      participant: {
        max: 8
      },
      observer: {
        max: -1
      }
    }
  },

  forum: {
    steps: {
      setUp: {
        enabled: true,
        socialMediaGraphics: false
      }, 
      facilitatiorAndTopics: {
        enabled: true,
        survays: false
      }, 
      manageSessionEmails: {
        enabled: true
      },
      manageSessionParticipants: {
        enabled: true,
        sendGroupSms: false
      }, 
      inviteSessionObservers: {
        enabled: true,
        sendGroupSms: false
      }
    },
    features: {
      survay: {
        prizeDraw: {
          enabled: false
        },
        contactList: {
          enabled: false
        },
      },
      unidentifiedParticipants: {
        enabled: false
      },
      whiteboard: {
        enabled: true,
        canWrite: ['facilitator']
      },
      pinboard: {
        enabled: false
      },
      sendSms: {
        enabled: false
      },
      closeSession: {
        enabled: true
      },
      dateAndTime: {
        enabled: true
      },
      anonymous: {
        enabled: true
      },
      colorScheme: {
        type: "forum"
      }
    },
    validations: {
      participant: {
        max: -1
      },
      observer: {
        max: -1
      }
    }
  },

  socialForum: {
    steps: {
      setUp: {
        enabled: true,
        socialMediaGraphics: true
      }, 
      facilitatiorAndTopics: {
        enabled: true,
        survays: true
      }, 
      manageSessionEmails: {
        enabled: false
      },
      manageSessionParticipants: {
        enabled: false
      }, 
      inviteSessionObservers: {
        enabled: false
      }
    },
    features: {
      survay: {
        prizeDraw: {
          enabled: true
        },
        contactList: {
          enabled: true
        },
      },
      unidentifiedParticipants: {
        enabled: true
      },
      whiteboard: {
        enabled: true,
        canWrite: ['facilitator']
      },
      pinboard: {
        enabled: false
      },
      sendSms: {
        enabled: false
      },
      closeSession: {
        enabled: false
      },
      dateAndTime: {
        enabled: false,
        //message will be updated with TA1560
        message: "Not avaliable"
      },
      anonymous: {
        enabled: false,
        //message will be updated with TA1560
        message: "Not avaliable"
      },
      colorScheme: {
        type: "forum"
      }
    },
    validations: {
      participant: {
        max: 0
      },
      observer: {
        max: 0
      }
    }
  }

}
