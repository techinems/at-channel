//local packages
const { postToChannel, sendRejectionDm } = require("./message.js");
const { updateModMessage } = require("../utilities/helperFunctions.js");
const {
  app: {
    client: {
      chat: { postEphemeral }
    }
  }
} = require("../utilities/bolt.js");

//globals
const TOKEN = process.env.SLACK_BOT_TOKEN;

/**
Three similar actions for approved, approved without at and rejected.
Calls to post to the original channel, updates the moderatation
channel, and notifies the requestor if required are made.
*/
const approveMessage = (
  channel_id,
  text,
  user_id,
  adminMessageTs,
  approver
) => {
  postToChannel(channel_id, text, user_id, true);
  updateModMessage(
    "approved",
    channel_id,
    text,
    user_id,
    adminMessageTs,
    approver
  );
};

const approveNoAt = (channel_id, text, user_id, adminMessageTs, approver) => {
  postToChannel(channel_id, text, user_id, false);
  updateModMessage(
    "approved without at-channel",
    channel_id,
    text,
    user_id,
    adminMessageTs,
    approver
  );
};

const rejectMessage = (channel_id, text, user_id, adminMessageTs, rejector) => {
  updateModMessage(
    "rejected",
    channel_id,
    text,
    user_id,
    adminMessageTs,
    rejector
  );
  sendRejectionDm(channel_id, user_id, text, rejector);
};

const cancelRequest = (channel_id, user_id, ts) => {
  updateModMessage("cancelled", channel_id, "", user_id, ts, "");
  postEphemeral({
    token: TOKEN,
    channel: channel_id,
    user: user_id,
    text: ":hugging_face: Your at-channel request *has been cancelled*."
  });
};

module.exports = { approveMessage, approveNoAt, rejectMessage, cancelRequest };
