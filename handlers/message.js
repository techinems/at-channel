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
  postMessage({
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
            action_id: `APP_${hash}`,
            value: "APP_"
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Reject"
            },
            style: "danger",
            action_id: `REJ_${hash}`,
            value: "REJ_"
          }
        ]
      }
    ]
  });
};

const postToChannel = (channel, text, user_name) => {
  postMessage({
    token: TOKEN,
    channel: channel,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `<@${user_name}> has sent the following message to <!channel>:\n\n${text}`
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
