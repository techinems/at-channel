//local packages
const { postToChannel, sendRejectionDm } = require("./message.js");
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

const rejectMessage = (channel_id, text, user_id, adminMessageTs, rejector) => {
  updateModMessage(false, channel_id, text, user_id, adminMessageTs, rejector);
  sendRejectionDm(channel_id, user_id, text, rejector);
};

module.exports = { approveMessage, rejectMessage };
