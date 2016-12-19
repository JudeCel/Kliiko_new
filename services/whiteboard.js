'use strict';

// This service is only to get some information !!!
// Don't use it in other cases !!!

module.exports = {
  defaultTopicImageParams: defaultTopicImageParams
};

function defaultTopicImageParams(sessionTopic, sessionMember) {
  return {
    sessionMemberId: sessionMember.id,
    sessionTopicId: sessionTopic.id,
    uid: "defaultImage" + sessionTopic.id,
    event: {
      id: "defaultImage" + sessionTopic.id,
      action: "draw", 
      element: {
        attr: {
          x: "10", 
          y: "20", 
          href: "/images/default-topic-image.gif?" + sessionTopic.id, 
          width: "395", 
          height: "304", 
          transform: "matrix(1,0,0,1,262,26)", 
          preserveAspectRatio: "none"
        }, 
        type: "image"
      }
    }
  };
}