'use strict';
module.exports = {

  focus: {
    steps: {
      setUp: {
        enabled: true
      }, 
      facilitatiorAndTopics: {
        enabled: true
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
    fields: {
      //here are only fields that can have different logic
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
      }
    },
    validations: {
      participant: {
        min: 1,
        max: 8
      },
      observer: {
        min: 0,
        max: -1
      },
      topic: {
        min: 1,
        max: -1
      }
    }
  },

  forum: {
    steps: {
      setUp: {
        enabled: true
      }, 
      facilitatiorAndTopics: {
        enabled: true
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
    fields: {
      //here are only fields that can have different logic
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
      }
    },
    validations: {
      participant: {
        min: 1,
        max: -1
      },
      observer: {
        min: 0,
        max: -1
      },
      topic: {
        min: 1,
        max: -1
      }
    }
  },

  socialForum: {
    steps: {
      setUp: {
        enabled: true
      }, 
      facilitatiorAndTopics: {
        enabled: true
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
    fields: {
      //here are only fields that can have different logic
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
      }
    },
    validations: {
      participant: {
        min: 0,
        max: 0
      },
      observer: {
        min: 0,
        max: 0
      },
      topic: {
        min: 1,
        max: -1
      }
    }
  }

}
