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
        enabled: true
      }, 
      inviteSessionObservers: {
        enabled: true
      }
    },
    fields: {
      //here are only fields that can have different logic
    },
    features: {
      prizeDrawSurvay: {
        enabled: false
      },
      contactListSurvay: {
        enabled: false
      },
      unidentifiedParticipants: {
        enabled: false
      },
      participants: {
        enabled: true
      },
      observers: {
        enabled: true
      },
      whiteboard: {
        enabled: true,
        canWrite: ['facilitator', 'participant']
      },
      pinboard: {
        enabled: true
      }
    },
    validations: {
      participants: {
        min: 1,
        max: 8
      },
      observers: {
        min: 0,
        max: -1
      },
      topics: {
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
        enabled: true
      }, 
      inviteSessionObservers: {
        enabled: true
      }
    },
    fields: {
      //here are only fields that can have different logic
    },
    features: {
      prizeDrawSurvay: {
        enabled: false
      },
      contactListSurvay: {
        enabled: false
      },
      unidentifiedParticipants: {
        enabled: false
      },
      participants: {
        enabled: true
      },
      observers: {
        enabled: true
      },
      whiteboard: {
        enabled: true,
        canWrite: ['facilitator']
      },
      pinboard: {
        enabled: false
      }
    },
    validations: {
      participants: {
        min: 1,
        max: -1
      },
      observers: {
        min: 0,
        max: -1
      },
      topics: {
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
      prizeDrawSurvay: {
        enabled: true
      },
      contactListSurvay: {
        enabled: true
      },
      unidentifiedParticipants: {
        enabled: true
      },
      participants: {
        enabled: false
      },
      observers: {
        enabled: false
      },
      whiteboard: {
        enabled: true,
        canWrite: ['facilitator']
      },
      pinboard: {
        enabled: false
      }
    },
    validations: {
      participants: {
        min: 0,
        max: 0
      },
      observers: {
        min: 0,
        max: 0
      },
      topics: {
        min: 1,
        max: -1
      }
    }
  }
}
