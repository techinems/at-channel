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
const { randomEmoji, genMarkdownSection, genActionButton } = require("../utilities/helperFunctions");
//globals
const TOKEN = process.env.SLACK_BOT_TOKEN;

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
        text: randomEmoji("happy") + " Thanks for your request! It's been sent to the moderators for approval."
      });
      postMessage({
        token: TOKEN,
        channel: user_id,
        user: user_id,
        text: "Your message has been sent to the moderators for approval.",
        blocks: [
          genMarkdownSection(`You requested an at-channel messasge to be sent to <#${channel_id}>. It has been sent to the moderators for approval.\nYou wrote:\n>>>${text}`),
          { type: "divider" },
          genMarkdownSection('*Want to cancel your message?*'),
          {
            type: "actions",
            elements: [
              genActionButton(`CAN_${requestId}`, "Cancel @channel request", "danger")
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
