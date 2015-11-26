module.exports = {
    sessStatus: {
        none: 0,
        invalid: 100000100,
        valid: 100000200
    },
    sessType: {
	    none: 0,
	    standard: 101000100,
	    anonymous: 101000200
    },
	accountStatus: {
		none: 0,
		trial: 102000100,
		trialExpired: 102000200,
		active: 102000300,
		nonPayment: 102000400
	},
	billingIntervalType:
	{   none: 0,
		monthly: 103000100,
		annual: 103000200
	},
	sessionStatus: {
		none: 0,
        pending: 104000100,
		open: 104000200,
        closed: 104000300
    },
    reportType: {
	    none: 0,
        chat: 109000100,
        chat_stars: 109000200,
        whiteboard: 109000300,
        vote: 109000400,
        stats: 109000500
    },
	userRole: {
		none: 0,
		accountManager: 106000100,
		facilitator: 106000200,
		observer: 106000300,
		participant: 106000400
    },
	userStatus: {
		none: 0,
		active: 107000100,
		inactive: 107000200
	},
	resourceType: {
		none: 0,
		image: 108000100,
		audio: 108000200,
		video: 108000300,
		document: 108000400
	},
	topicStatus: {
		none: 0,
		active: 110000100,
		inactive: 110000200
	}
};
