//node packages
require("dotenv").config();

//local packages
const { app } = require("./utilities/bolt.js");
const { slashChannel } = require("./handlers/slashCommands.js");
const { approveMessage, rejectMessage } = require("./handlers/buttons.js");

app.command(
  "/channel",
  async ({ ack, next }) => {
    ack();
    next();
  },
  slashChannel
);

app.action(/^APP_.*/, async ({ ack, body: { message: { ts, blocks } } }) => {
  ack();
  const channel_id = /#(.*?)[a-zA-Z1-9]{9}/
    .exec(blocks[0].text.text)[0]
    .replace("#", "");
  const text = blocks[1].text.text.replace("&gt;&gt;&gt;", "");
  const user_id = /@(.*?)[a-zA-Z1-9]{9}/
    .exec(blocks[0].text.text)[0]
    .replace("@", "");
  approveMessage(channel_id, text, user_id, ts);
});

app.action(/^REJ_.*/, async ({ ack, body: { message: { ts, blocks } } }) => {
  ack();
  const channel_id = /#(.*?)[a-zA-Z1-9]{9}/
    .exec(blocks[0].text.text)[0]
    .replace("#", "");
  const text = blocks[1].text.text.replace("&gt;&gt;&gt;", "");
  const user_id = /@(.*?)[a-zA-Z1-9]{9}/
    .exec(blocks[0].text.text)[0]
    .replace("@", "");
  rejectMessage(channel_id, text, user_id, ts);
});
