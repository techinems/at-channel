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
 * Actions for an approved message: posts the message to the channel requested and updates
 * the mod message appropriately
 *
 * @param {string} channel_id - Slack channel ID, such as "CFCP42RL7" (without <, >, or #
 * characters)
 * @param {string} text - Message that was requested
 * @param {string} user_id - Slack user ID (without <, >, or # characters)
 * @param {string} adminMessageTs - Timestamp of the moderation message
 * @param {string} approver - User ID of the approving moderator
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

/**
 * Actions for a message approved without @channel: posts the message to the channel
 * requested (without an @channel) and updates the mod message appropriately
 *
 * @param {string} channel_id - Slack channel ID, such as "CFCP42RL7" (without <, >, or #
 * characters)
 * @param {string} text - Message that was requested
 * @param {string} user_id - Slack user ID (without <, >, or # characters)
 * @param {string} adminMessageTs - Timestamp of the moderation message
 * @param {string} approver - User ID of the approving moderator
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

/**
 * Actions for a rejected message: sends a rejection notice to the original requester and
 * updates the mod message appropriately
 *
 * @param {string} channel_id - Slack channel ID, such as "CFCP42RL7" (without <, >, or #
 * characters)
 * @param {string} text - Message that was requested
 * @param {string} user_id - Slack user ID (without <, >, or # characters)
 * @param {string} adminMessageTs - Timestamp of the moderation message
 * @param {string} approver - User ID of the approving moderator
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

/**
 * Actions for a requested message cancelled by the requester: updates the moderation
 * message appropriately and sends an ephemeral message to the original requester letting
 * them know that their request was cancelled.
 *
 * @param {string} channel_id - Slack channel ID, such as "CFCP42RL7" (without <, >, or #
 * characters)
 * @param {string} user_id - Slack user ID (without <, >, or # characters)
 * @param {string} ts - Timestamp of the moderation message
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
