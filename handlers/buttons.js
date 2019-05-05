//local packages
const { postToChannel } = require("./message.js");
const {
  app: {
    client: { chat: update }
  }
} = require("../utilities/bolt.js");
const { updateModMessage } = require("../utilities/helperFunctions.js");

const approveMessage = (
  channel_id,
  text,
  user_id,
  adminMessageTs,
  approver
) => {
  postToChannel(channel_id, text, user_id);
  updateModMessage(true, channel_id, text, user_id, adminMessageTs, approver);
};

module.exports = { approveMessage };
