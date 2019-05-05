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

const approveMessage = (
  channel_id,
  text,
  user_id,
  adminMessageTs,
  approver
) => {
  postToChannel(channel_id, text, user_id);
  updateModMessage(
    "approved",
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

const deleteRequest = (channel_id, user_id, ts) => {
  updateModMessage("deleted", channel_id, "", user_id, ts, "");
  postEphemeral({
    token: TOKEN,
    channel: channel_id,
    user: user_id,
    text: ":hugging_face: Your at-channel request *has been deleted*."
  });
};

module.exports = { approveMessage, rejectMessage, deleteRequest };
