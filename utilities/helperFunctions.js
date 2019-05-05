//local packages
const {
  app: {
    client: {
      usergroups: {
        users: { list }
      },
      chat: { postEphemeral, update }
    }
  }
} = require("../utilities/bolt.js");

//globals
const TOKEN = process.env.SLACK_BOT_TOKEN;
const USER_TOKEN = process.env.SLACK_USER_TOKEN;
const MOD_CHANNEL_ID = process.env.MOD_CHANNEL_ID;
const ADMIN_USERGROUP_ID = process.env.ADMIN_USERGROUP_ID;
const MOD_USERGROUP_ID = process.env.MOD_USERGROUP_ID;

const isModerator = async ({
  body: {
    user: { id },
    channel: { id: channelId }
  },
  next
}) => {
  const { users: adminUsers } = await list({
    token: USER_TOKEN,
    usergroup: ADMIN_USERGROUP_ID
  });
  if (adminUsers.includes(id)) return next();
  const { users: modUsers } = await list({
    token: USER_TOKEN,
    usergroup: MOD_USERGROUP_ID
  });
  if (modUsers.includes(id)) return next();
  return postEphemeral({
    token: TOKEN,
    channel: channelId,
    user: id,
    text:
      ":cry: Sorry! You're not a moderator, so you cannot approve or reject these requests."
  });
};

const updateModMessage = (
  approved,
  channel_id,
  text,
  user_id,
  ts,
  moderator
) => {
  let emoji, status;
  if (approved) {
    emoji = ":heavy_check_mark:";
    status = "approved";
  } else {
    emoji = ":x:";
    status = "rejected";
  }
  update({
    token: TOKEN,
    channel: MOD_CHANNEL_ID,
    ts: ts,
    blocks: [
      {
        type: "section",
        text: { type: "mrkdwn", text: `${emoji} The message:` }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `>>>${text}`
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `that <@${user_id}> requested to post in <#${channel_id}> has been *${status}* by <@${moderator}>.`
        }
      }
    ]
  });
};

module.exports = { isModerator, updateModMessage };
