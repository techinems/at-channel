//node packages
const md5 = require("md5");
const emojiRegex = require("emoji-regex")();

//local packages
const {
  app: {
    client: {
      chat: { postEphemeral, postMessage }
    }
  }
} = require("../utilities/bolt.js");
const { sendForApproval, postToChannel } = require("./message.js");
const { randomEmoji } = require("../utilities/helperFunctions");
//globals
const TOKEN = process.env.SLACK_BOT_TOKEN;

/**
 * Used to determine if a request was sent in a moderated channel, post the request to the moderation channel
 * and send information to the requester. If not in a moderated channel, post the message automatically
 * 
 * @param {string} channel_name - slack channel name such as "general" (no #)
 * @param {string} channel_id - slack channel ID such as "CFCP42RL7" (no <#, >)
 * @param {string} user_id - slack user ID (no <@, >)
 * @param {string} text - message to be posted
 */
const slashChannel = async ({
  command: { channel_name, channel_id, user_id, text }
}) => {
  text = text.replace(emojiRegex, "");
  if (text == "" || text == "&gt;" || text == "&gt;&gt;&gt;") {
    postEphemeral({
      token: TOKEN,
      channel: channel_id,
      user: user_id,
      text:  randomEmoji("medium") + " Maybe try actually writing something?"
    });
    return;
  }
  //determine if we are in a moderated channel, otherwise post automatically.
  switch (channel_name) {
    case "general":
    case "alerts":
    case "random":
    case "scheduling":
      // send request to the moderation channel
      const requestId = await sendForApproval(
        text,
        channel_id,
        user_id,
        md5(text)
      );
      // Post emphemeral to user in active channel
      postEphemeral({
        token: TOKEN,
        channel: channel_id,
        user: user_id,
        text:
          randomEmoji("happy") + " Thanks for your request! It's been sent to the moderators for approval."
      });
      // Post slackbot message to user to allow for cancelation of request
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
