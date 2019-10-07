//node packages

//local packages
const {
  app: {
    client: {
      chat: { postMessage }
    }
  }
} = require("../utilities/bolt.js");
const { getMarkdownSection, getActionButton } = require("../utilities/helperFunctions");

//globals
const TOKEN = process.env.SLACK_BOT_TOKEN;

//package config

const sendForApproval = async (text, channel_id, user_id, hash) => {
  const { ts } = await postMessage({
    token: TOKEN,
    channel: "at-channel-requests",
    text: "There's a new at-channel request!",
    blocks: [
      getMarkdownSection(`:wave: Hello, kind moderators!\n\n<@${user_id}> has requested to use at-channel in <#${channel_id}>. The message is:`),
      getMarkdownSection(`>>>${text}`),
      { type: "divider" },
      getMarkdownSection("Do you want to *approve* or *reject* this message?"),
      {
        type: "actions",
        elements: [
          getActionButton(`APP_${hash}`, "Approve", "primary"),
          getActionButton(`NOAT_${hash}`, "Approve without @channel"),
          getActionButton(`REJ_${hash}`, "Reject", "danger")
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
      getMarkdownSection(`<@${user_id}> has sent the following message to ${atChannelText}:\n\n${text}`)
    ]
  });
};

const sendRejectionDm = (channel_id, user_id, text, rejecter) => {
  postMessage({
    token: TOKEN,
    channel: user_id,
    text: `Your at-channel request has been rejected by <@${rejecter}>`,
    blocks: [
      getMarkdownSection(":face_with_hand_over_mouth: Your message:"),
      getMarkdownSection(`>>>${text}`),
      getMarkdownSection(`has been rejected by <@${rejecter}>.`)
    ]
  });
};

module.exports = { sendForApproval, postToChannel, sendRejectionDm };
