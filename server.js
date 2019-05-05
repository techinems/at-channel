//node packages
require("dotenv").config();

//local packages
const { app } = require("./utilities/bolt.js");
const { isModerator } = require("./utilities/helperFunctions.js");
const { slashChannel } = require("./handlers/slashCommands.js");
const {
  approveMessage,
  rejectMessage,
  deleteRequest
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
  /^(REJ|APP)_.*/,
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
    const channel_id = /#(.*?)[a-zA-Z1-9]{9}/
      .exec(blocks[0].text.text)[0]
      .replace("#", "");
    const text = blocks[1].text.text.replace("&gt;&gt;&gt;", "");
    const user_id = /@(.*?)[a-zA-Z1-9]{9}/
      .exec(blocks[0].text.text)[0]
      .replace("@", "");
    if (/^APP_.*/.test(action_id)) {
      approveMessage(channel_id, text, user_id, ts, id);
    } else if (/^REJ_.*/.test(action_id)) {
      rejectMessage(channel_id, text, user_id, ts, id);
    } else if (/^DEL_.*/.test(action_id)) {
      deleteRequest(channel_id, text, user_id, ts, id);
    }
  }
);

app.action(
  /^DEL_.*/,
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
    const ts = action_id.replace("DEL_", "");
    deleteRequest(channel_id, user_id, ts);
  }
);
