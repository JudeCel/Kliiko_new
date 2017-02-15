'use strict';

// This service is only to get some information !!!
// Don't use it in other cases !!!

module.exports = {
  defaultTopicImageParams: defaultTopicImageParams
};

function defaultTopicImageParams(sessionTopic, sessionMember) {
  let link = process.env.SERVER_CHAT_DOMAIN_URL + ':' + process.env.SERVER_CHAT_DOMAIN_PORT + "/images/default-topic-image.gif?" + sessionTopic.id;
  return {
    sessionMemberId: sessionMember.id,
    sessionTopicId: sessionTopic.id,
    uid: "defaultImage" + sessionTopic.id,
    eventType: "image",
    event: {
      id: "defaultImage" + sessionTopic.id,
      action: "draw",
      element: "<image id=\"defaultImage"+sessionTopic.id+"\" xmlns:xlink="+link+" xlink:href="+link+" width='395' height='304' x='10' y='76' fill='none'></image>"
    }
  };
}
