//node packages

//local packages
const {
  app: {
    client: {
      chat: { postMessage }
    }
  }
} = require("../utilities/bolt.js");

//globals
const TOKEN = process.env.SLACK_BOT_TOKEN;

//package config
/** provides functions for posting nicely formated messages in approriate channels */

/**
 *  prepare and post message in the moderation channel for new requests
 * 
 *  @param {string} text - message to be approved
 *  @param {string} channel_id - channel ID message will be posted to
 *  @param {string} user_id - user ID of requester
 *  @param {string} hash - identifier of request used for tracking requests. Usually MD5 of text.
 *  @returns {string} ts - timestamp ID from slack API postMessage call 
 */
const sendForApproval = async (text, channel_id, user_id, hash) => {
  const { ts } = await postMessage({
    token: TOKEN,
    channel: "at-channel-requests",
    text: "There's a new at-channel request!",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `:wave: Hello, kind moderators!\n\n<@${user_id}> has requested to use at-channel in <#${channel_id}>. The message is:`
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `>>>${text}`
        }
      },
      {
        type: "divider"
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "Do you want to *approve* or *reject* this message?"
        }
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Approve"
            },
            style: "primary",
            action_id: `APP_${hash}`
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Approve without @channel"
            },
            action_id: `NOAT_${hash}`
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Reject"
            },
            style: "danger",
            action_id: `REJ_${hash}`
          }
        ]
      }
    ]
  });
  return ts;
};

/**
 *  prepare and post approved message to the original channel (for approved with at channel and without at channel)
 * 
 *  @param {string} channel_id - channel ID message will be posted to
 *  @param {string} text - message to be approved
 *  @param {string} user_id - user ID of requester
 *  @param {boolean} atChannel - if approved with @channel or no at channel, default true
*/
const postToChannel = (channel_id, text, user_id, atChannel = true) => {
  const atChannelText = atChannel ? "<!channel>" : "the channel";
  postMessage({
    token: TOKEN,
    channel: channel_id,
    text: `<@${user_id}> has sent a message to the channel.`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `<@${user_id}> has sent the following message to ${atChannelText}:\n\n${text}`
        }
      }
    ]
  });
};

/**
 *  prepare and post rejection to requesting user as slackbot DM
 *  
 *  @param {string} channel_id - channel ID message request originated
 *  @param {string} user_id - user ID of requester
 *  @param {string} text - message that was rejected
 *  @param {string} rejecter - user ID of moderator that rejected the message
 */
const sendRejectionDm = (channel_id, user_id, text, rejecter) => {
  postMessage({
    token: TOKEN,
    channel: user_id,
    text: `Your at-channel request has been rejected by <@${rejecter}>`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: ":face_with_hand_over_mouth: Your message:"
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `>>>${text}`
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `has been rejected by <@${rejecter}>.`
        }
      }
    ]
  });
};

module.exports = { sendForApproval, postToChannel, sendRejectionDm };
