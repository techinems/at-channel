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

const sendForApproval = async (text, channel_id, user_id, hash) => {
  const { ts } = await postMessage({
    token: TOKEN,
    channel: "at-channel-requests",
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

const postToChannel = (channel_id, text, user_id) => {
  postMessage({
    token: TOKEN,
    channel: channel_id,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `<@${user_id}> has sent the following message to <!channel>:\n\n${text}`
        }
      }
    ]
  });
};

const sendRejectionDm = (channel_id, user_id, text, rejector) => {
  postMessage({
    token: TOKEN,
    channel: user_id,
    text: "Your at-channel message has been rejected.",
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
          text: `has been rejected by <@${rejector}>.`
        }
      }
    ]
  });
};

module.exports = { sendForApproval, postToChannel, sendRejectionDm };
