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
 * Handles /channel commands: first determines if the request is blank. If so, it lets the
 * requester know as much. Next, was the request sent in a moderated channel? If so, the
 * message is sent to the moderation channel for approval, and an ephemeral message is
 * posted to the requester to inform them of this. If the message was sent to a
 * non-moderated channel, the message is immediately sent to said channel.
 *
 * @param {string} channel_name - Slack channel name, such as "general" (no # character)
 * @param {string} channel_id - Slack channel ID, such as "CFCP42RL7" (without <, >, or #
 * characters)
 * @param {string} user_id - Slack user ID (without <, >, or # characters)
 * @param {string} text - Message that was requested
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
      // post emphemeral to user in active channel
      postEphemeral({
        token: TOKEN,
        channel: channel_id,
        user: user_id,
        text:
          randomEmoji("happy") + " Thanks for your request! It's been sent to the moderators for approval."
      });
      // post Slackbot message to user to allow for cancellation of request
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
    // if not a moderated channel, simply most the message immediately
      postToChannel(channel_id, text, user_id);
  }
};

module.exports = { slashChannel };
