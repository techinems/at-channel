//node packages

//local packages
const { app } = require("../utilities/bolt.js");

//globals
const TOKEN = process.env.SLACK_BOT_TOKEN;

//package config

const slashChannel = async ({ command: { channel_id, user_id, text } }) => {
  app.client.chat.postEphemeral({
    token: TOKEN,
    channel: channel_id,
    user: user_id,
    text: " ",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `:raised_hands: *Thanks for your message!* It has been sent to the moderators for approval.\nYou wrote:\n>>>${text}`
        }
      },
      {
        type: "divider"
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Want to cancel your message?*"
        }
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Cancel @channel request"
            },
            style: "danger",
            value: "FILL_IN_LATER"
          }
        ]
      }
    ]
  });
};

module.exports = { slashChannel };
