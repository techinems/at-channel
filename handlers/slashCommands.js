//node packages
const md5 = require("md5");

//local packages
const { app } = require("../utilities/bolt.js");
const { sendForApproval, postToChannel } = require("./message.js");

//globals
const TOKEN = process.env.SLACK_BOT_TOKEN;

//package config

const slashChannel = async ({
  command: { channel_name, channel_id, user_id, text }
}) => {
  switch (channel_name) {
    case "general":
    case "alerts":
    case "random":
    case "scheduling":
      const requestId = await sendForApproval(
        text,
        channel_id,
        user_id,
        md5(text)
      );
      app.client.chat.postEphemeral({
        token: TOKEN,
        channel: channel_id,
        user: user_id,
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
                value: `DEL_${requestId}`
              }
            ]
          }
        ]
      });
      break;
    default:
      postToChannel(text, channel_id, user_id);
  }
};

module.exports = { slashChannel };
