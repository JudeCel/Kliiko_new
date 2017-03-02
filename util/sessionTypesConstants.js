'use strict';

//Make sure you copied changes you do here to chat project tests file !!!

module.exports = {

  "focus": {
    "steps": {
      "setUp": {
        "enabled": true,
      }, 
      "facilitatiorAndTopics": {
        "enabled": true
      }, 
      "manageSessionEmails": {
        "enabled": true
      },
      "manageSessionParticipants": {
        "enabled": true,
        "sendGroupSms": true
      }, 
      "inviteSessionObservers": {
        "enabled": true,
        "sendGroupSms": false
      }
    },
    "features": {
      "survay": {
        "enabled": false
      },
      "ghostParticipants": {
        "enabled": false
      },
      "whiteboard": {
        "enabled": true,
        "canWrite": ["facilitator", "participant"]
      },
      "pinboard": {
        "enabled": true
      },
      "sendSms": {
        "enabled": true
      },
      "closeSession": {
        "enabled": true
      },
      "dateAndTime": {
        "enabled": true
      },
      "anonymous": {
        "enabled": true
      },
      "colorScheme": {
        "type": "focus"
      },
      "socialMediaGraphics": {
        "enabled": false
      }
    },
    "validations": {
      "participant": {
        "max": 8
      },
      "observer": {
        "max": -1
      }
    }
  },

  "forum": {
    "steps": {
      "setUp": {
        "enabled": true
      }, 
      "facilitatiorAndTopics": {
        "enabled": true
      }, 
      "manageSessionEmails": {
        "enabled": true
      },
      "manageSessionParticipants": {
        "enabled": true,
        "sendGroupSms": false
      }, 
      "inviteSessionObservers": {
        "enabled": true,
        "sendGroupSms": false
      }
    },
    "features": {
      "survay": {
        "enabled": false
      },
      "ghostParticipants": {
        "enabled": false
      },
      "whiteboard": {
        "enabled": true,
        "canWrite": ["facilitator"]
      },
      "pinboard": {
        "enabled": false
      },
      "sendSms": {
        "enabled": false
      },
      "closeSession": {
        "enabled": true
      },
      "dateAndTime": {
        "enabled": true
      },
      "anonymous": {
        "enabled": true
      },
      "colorScheme": {
        "type": "forum"
      },
      "socialMediaGraphics": {
        "enabled": false
      }
    },
    "validations": {
      "participant": {
        "max": -1
      },
      "observer": {
        "max": -1
      }
    }
  },

  "socialForum": {
    "steps": {
      "setUp": {
        "enabled": true
      }, 
      "facilitatiorAndTopics": {
        "enabled": true,
        "hideNext": true
      }, 
      "manageSessionEmails": {
        "enabled": false
      },
      "manageSessionParticipants": {
        "enabled": false
      }, 
      "inviteSessionObservers": {
        "enabled": false
      },
      "message": "It's even easier to build Social Forum, so you don't need steps 3 to 5."
    },
    "features": {
      "survay": {
        "enabled": true
      },
      "ghostParticipants": {
        "enabled": true
      },
      "whiteboard": {
        "enabled": true,
        "canWrite": ["facilitator"]
      },
      "pinboard": {
        "enabled": false
      },
      "sendSms": {
        "enabled": false
      },
      "closeSession": {
        "enabled": false
      },
      "dateAndTime": {
        "enabled": false,
        "message": "Yay! One less thing you have to do. Start & End Date isn't required with Social Forum"
      },
      "anonymous": {
        "enabled": false
      },
      "colorScheme": {
        "type": "forum"
      },
      "socialMediaGraphics": {
        "enabled": true,
        "message": "We're currently building an exciting tool for you to customize your social media posts and help your Chat Session stand out. We'll keep you updated on progress ☺"
      }
    },
    "validations": {
      "participant": {
        "max": 0
      },
      "observer": {
        "max": 0
      }
    }
  }

}
