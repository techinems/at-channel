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

/***
 * actions for approved message, calls to post to the original channel and updates the moderatation
 * channel
 * 
 * @param {string} channel_id - slack channel ID such as "CFCP42RL7" (no <#, >)
 * @param {string} text - message that was requested
 * @param {string} user_id - slack user ID (no <@, >)
 * @param {string} adminMessageTs - timestamp of message in the moderation channel
 * @param {string} approver - user ID of moderator approving
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

/***
 * actions for approved message without at channel, calls to post to the original channel and updates the moderatation
 * channel
 * 
 * @param {string} channel_id - slack channel ID such as "CFCP42RL7" (no <#, >)
 * @param {string} text - message that was requested
 * @param {string} user_id - slack user ID (no <@, >)
 * @param {string} adminMessageTs - timestamp of message in the moderation channel
 * @param {string} approver - user ID of moderator approving
 */
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

/***
 * actions for denyied/rejected message, updates the moderatation channel and sends rejection DM to requester.
 * 
 * @param {string} channel_id - slack channel ID such as "CFCP42RL7" (no <#, >)
 * @param {string} text - message that was requested
 * @param {string} user_id - slack user ID (no <@, >)
 * @param {string} adminMessageTs - timestamp of message in the moderation channel
 * @param {string} rejecter - user ID of moderator denying request
 */
const rejectMessage = (channel_id, text, user_id, adminMessageTs, rejecter) => {
  updateModMessage(
    "rejected",
    channel_id,
    text,
    user_id,
    adminMessageTs,
    rejecter
  );
  sendRejectionDm(channel_id, user_id, text, rejecter);
};

/***
 * action for message request cancelled by requester
 * 
 * @param {string} channel_id - slack channel ID such as "CFCP42RL7" (no <#, >)
 * @param {string} user_id - slack user ID (no <@, >)
 * @param {string} ts - timestamp ID of moderation message
 */
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
