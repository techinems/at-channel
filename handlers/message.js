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

//package config

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
