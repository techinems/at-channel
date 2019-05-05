//local packages
const { postToChannel } = require("./message.js");

const approveMessage = (channel_id, text, user_id, adminMessage) => {
  postToChannel(channel_id, text, user_id);
};

module.exports = { approveMessage };
