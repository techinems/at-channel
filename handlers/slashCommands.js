//node packages
const md5 = require("md5");

//local packages
const {
  app: {
    client: {
      chat: { postEphemeral, postMessage }
    }
  }
} = require("../utilities/bolt.js");
const { sendForApproval, postToChannel } = require("./message.js");

//globals
const TOKEN = process.env.SLACK_BOT_TOKEN;

const slashChannel = async ({
  command: { channel_name, channel_id, user_id, text }
}) => {
  if (text == "" || text == "&gt;" || text == "&gt;&gt;&gt;") {
    postEphemeral({
      token: TOKEN,
      channel: channel_id,
      user: user_id,
      text: ":thinking_face: Maybe try actually writing something?"
    });
  }
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
      postEphemeral({
        token: TOKEN,
        channel: channel_id,
        user: user_id,
        text:
          ":raised_hands: Thanks for your request! It's been sent to the moderators for approval."
      });
      postMessage({
        token: TOKEN,
        channel: user_id,
        user: user_id,
        text: "Your message has been sent to the moderators for approval.",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `You requsted an at-channel messasge to be sent to <#${channel_id}>. It has been sent to the moderators for approval.\nYou wrote:\n>>>${text}`
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
                action_id: `CAN_${requestId}`
              }
            ]
          }
        ]
      });
      break;
    default:
      postToChannel(channel_id, text, user_id);
  }
};

module.exports = { slashChannel };
