//node packages
require("dotenv").config();

//local packages
const { app } = require("./utilities/bolt.js");
const { isModerator } = require("./utilities/helperFunctions.js");
const { slashChannel } = require("./handlers/slashCommands.js");
const {
  approveMessage,
  approveNoAt,
  rejectMessage,
  cancelRequest
} = require("./handlers/buttons.js");

app.command(
  "/channel",
  async ({ ack, next }) => {
    ack();
    next();
  },
  slashChannel
);

app.action(
  /** Action for if message was approved, rejected, or aprroved without @channe
  * determines which case and posts appropriate message */
  
  //APP = approved; NOAT = approved without @channel; REJ = reject
  /^(APP|NOAT|REJ)_.*/,
  async ({ ack, next }) => {
    ack();
    next();
  },
  isModerator,
  async ({
    action: { action_id },
    body: {
      message: { ts, blocks },
      user: { id }
    }
  }) => {
    const channel_id = /<#(.*?)[a-zA-Z0-9]{7,10}>/
      .exec(blocks[0].text.text)[0]
      .replace("<#", "")
      .replace(">", "");
    const text = blocks[1].text.text.replace("&gt;&gt;&gt;", "");
    const user_id = /<@(.*?)[a-zA-Z0-9]{7,10}>/
      .exec(blocks[0].text.text)[0]
      .replace("<@", "")
      .replace(">", "");
    if (/^APP_.*/.test(action_id)) {
      approveMessage(channel_id, text, user_id, ts, id);
    } else if (/^NOAT_.*/.test(action_id)) {
      approveNoAt(channel_id, text, user_id, ts, id);
    } else if (/^REJ_.*/.test(action_id)) {
      rejectMessage(channel_id, text, user_id, ts, id);
    }
  }
);

app.action(
  /** Action for when poster cancels at channel request */
  /^CAN_.*/,
  async ({ ack, next }) => {
    ack();
    next();
  },
  async ({
    action: { action_id },
    body: {
      channel: { id: channel_id },
      user: { id: user_id }
    }
  }) => {
    const ts = action_id.replace("CAN_", "");
    cancelRequest(channel_id, user_id, ts);
  }
);
