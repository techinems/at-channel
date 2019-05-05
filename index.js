//node packages
require("dotenv").config();

//local packages
const { app } = require("./utilities/bolt.js");
const { slashChannel } = require("./handlers/slashCommands.js");

app.command(
  "/channel",
  async ({ ack, next }) => {
    ack();
    next();
  },
  slashChannel
);
