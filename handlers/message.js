//node packages

//local packages
const {
  app: {
    client: {
      chat: { postMessage }
    }
  }
} = require("../utilities/bolt.js");
const { genMarkdownSection, genActionButton } = require("../utilities/helperFunctions");

//globals
const TOKEN = process.env.SLACK_BOT_TOKEN;

/** Functions for posting nicely formatted messages in appropriate channels */

/**
 * Prepare and post message in the moderation channel for new requests
 *
 * @param {string} text - Message that was requested
 * @param {string} channel_id - Slack channel ID, such as "CFCP42RL7" (without <, >, or #
 * characters), where the message was requested (i.e. not the moderation channel)
 * @param {string} user_id - Slack user ID (without <, >, or # characters) of the
 * requester
 * @param {string} hash - MD5 hash of the message text for tracking purposes; provided
 * by slashChannel
 * @returns {string} Timestamp of the mod message (from postMessage() function)
 */
const sendForApproval = async (text, channel_id, user_id, hash) => {
  const { ts } = await postMessage({
    token: TOKEN,
    channel: "at-channel-requests",
    text: "There's a new at-channel request!",
    blocks: [
      genMarkdownSection(`:wave: Hello, kind moderators!\n\n<@${user_id}> has requested to use at-channel in <#${channel_id}>. The message is:`),
      genMarkdownSection(`>>>${text}`),
      { type: "divider" },
      genMarkdownSection("Do you want to *approve* or *reject* this message?"),
      {
        type: "actions",
        elements: [
          genActionButton(`APP_${hash}`, "Approve", "primary"),
          genActionButton(`NOAT_${hash}`, "Approve without @channel"),
          genActionButton(`REJ_${hash}`, "Reject", "danger")
        ]
      }
    ]
  });
  return ts;
};

/**
 *  Prepare and post approved message to the requested channel, for those messages
 * approved with or without @channel
 *
 * @param {string} channel_id - Slack channel ID, such as "CFCP42RL7" (without <, >, or #
 * characters), to which the message will be posted
 * @param {string} text - Message text to post
 * @param {string} user_id - Slack user ID (without <, >, or # characters) of the
 * requester
 * @param {boolean} atChannel - Boolean for whether the message was approved with or
 * without @channel (default: true)
*/
const postToChannel = (channel_id, text, user_id, atChannel = true) => {
  const atChannelText = atChannel ? "<!channel>" : "the channel";
  postMessage({
    token: TOKEN,
    channel: channel_id,
    text: `<@${user_id}> has sent a message to the channel.`,
    blocks: [
      genMarkdownSection(`<@${user_id}> has sent the following message to ${atChannelText}:\n\n${text}`)
    ]
  });
};

/**
 *  Prepare and post rejection notice to requested (as a Slackbot DM)
 *
 * @param {string} channel_id - Slack channel ID, such as "CFCP42RL7" (without <, >, or #
 * characters), to which the message will be posted
 * @param {string} user_id - Slack user ID (without <, >, or # characters) of the
 * requester
 * @param {string} text - Text of rejected message
 * @param {string} rejecter - Slack user ID (without <, >, or # characters) of the
 * rejecting moderator
 */
const sendRejectionDm = (channel_id, user_id, text, rejecter) => {
  postMessage({
    token: TOKEN,
    channel: user_id,
    text: `Your at-channel request has been rejected by <@${rejecter}>`,
    blocks: [
      genMarkdownSection(":face_with_hand_over_mouth: Your message:"),
      genMarkdownSection(`>>>${text}`),
      genMarkdownSection(`has been rejected by <@${rejecter}>.`)
    ]
  });
};

module.exports = { sendForApproval, postToChannel, sendRejectionDm };
