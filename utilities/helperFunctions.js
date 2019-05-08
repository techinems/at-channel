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

// Note you will need to change this to fit emojis that exist in your workspace
const emojisList = require("./emoji.json");

//globals
const TOKEN = process.env.SLACK_BOT_TOKEN;
const USER_TOKEN = process.env.SLACK_USER_TOKEN;
const MOD_CHANNEL_ID = process.env.MOD_CHANNEL_ID;
const ADMIN_USERGROUP_ID = process.env.ADMIN_USERGROUP_ID;
const MOD_USERGROUP_ID = process.env.MOD_USERGROUP_ID;

const isModerator = async ({
  body: {
    user: { id },
    channel: { id: channelId },
    message: { blocks }
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
  const original_poster = /<@(.*?)[a-zA-Z0-9]{7,10}>/
    .exec(blocks[0].text.text)[0]
    .replace("<@", "")
    .replace(">", "");
  if (modUsers.includes(id) && id != original_poster) return next();
  if (id == original_poster) {
    return postEphemeral({
      token: TOKEN,
      channel: channelId,
      user: id,
      text:
        ":cry: Sorry! Moderators cannot approve or reject their own requests."
    });
  }
  return postEphemeral({
    token: TOKEN,
    channel: channelId,
    user: id,
    text:
      ":cry: Sorry! You're not a moderator, so you cannot approve or reject these requests."
  });
};

const updateModMessage = (status, channel_id, text, user_id, ts, moderator) => {
  if (status == "cancelled") {
    update({
      token: TOKEN,
      channel: MOD_CHANNEL_ID,
      ts: ts,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `:point_right: <@${user_id}>'s at-channel request *has been cancelled*.`
          }
        }
      ]
    });
    return;
  }
  
  const emoji = status == "approved" ? ":heavy_check_mark:" : ":x:";
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

const randomEmoji = (sentiment) => {
  let emojis = [];
  switch(sentiment){
    case "happy":
      emojis = emojisList.happy;
      break;
    case "medium":
      emojis = emojisList.medium;
      break;
    case "sad":
      emojis = emojisList.sad;
      break;
    default:
      emojis.concat(emojisList.happy);
      emojis.concat(emojisList.medium);
      emojis.concat(emojisList.sad);
      break;
  }
  return emojis[Math.floor(Math.random() * emojis.length)];
};

module.exports = { isModerator, updateModMessage, randomEmoji };
