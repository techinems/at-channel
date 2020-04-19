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

// Note all emojis used must already be defined within the workspace for them to work
const emojisList = require("./emojis");

//globals
const TOKEN = process.env.SLACK_BOT_TOKEN;
const MOD_CHANNEL_ID = process.env.MOD_CHANNEL_ID;
const ADMIN_USERGROUP_ID = process.env.ADMIN_USERGROUP_ID;
const MOD_USERGROUP_ID = process.env.MOD_USERGROUP_ID;

const genMarkdownSection = textForSection => ({ type: "section", text: { type: "mrkdwn", text: textForSection } });

const genActionButton = (action_id, text, style = null) => {
  let btn = { type: "button", text: { type: "plain_text", text }, action_id };
  if (style) btn.style = style;
  return btn;
};

/**
 * Extracts a channel ID or user ID from the first element of a Slack-provided blocks array.
 * 
 * @param {object[]} blocks - an array of blocks provided by the Slack API.
 * @param {RegExp} regex - the regular expression for matching to the ID
 * @param {string} tag  - the opening tag for the ID (should be either '<#' for channel ID or '<@' for user ID)
 */
const extractSlackId = (blocks, regex, tag) => regex.exec(blocks[0].text.text)[0].replace(tag, "").replace(">", "");

const ackNext = async ({ack, next}) => { ack(); next(); };

/**
 * Middleware to query Slack to determine if user has appropriate moderating permissions;
 * if not, post an ephemeral message to the user explaining why they can't approve;
 * otherwise, execute appropriate action
 *
 * @returns { next() } Go onto next step in middleware chain if all permission requirements
 * are met
 * @returns { function(): object } Post an ephemeral message to the user if permission
 * requirements are not met
 */
const isModerator = async ({
  body: {
    user: { id },
    channel: { id: channelId },
    message: { blocks }
  },
  next
}) => {
  const {users: adminUsers} = await list({
    token: TOKEN,
    usergroup: ADMIN_USERGROUP_ID
  });
  if (adminUsers.includes(id)) return next();
  const {users: modUsers} = await list({
    token: TOKEN,
    usergroup: MOD_USERGROUP_ID
  });
  const original_poster = extractSlackId(blocks, /<@(.*?)[a-zA-Z0-9]{7,10}>/, "<@");
  if (modUsers.includes(id) && id !== original_poster) return next();
  let text = ":cry: Sorry! You're not a moderator, so you cannot approve or reject these requests.";
  if (id === original_poster) {
    text = ":cry: Sorry! Moderators cannot approve or reject their own requests.";
  }
  return postEphemeral({
    token: TOKEN,
    channel: channelId,
    user: id,
    text: text
  });
};

/**
 * Updates the mod message appropriately based on which action was taken
 *
 * @param {string} status - One of "cancelled", "approved", or "approved without
 * at-channel"
 * @param {string} channel_id - Slack channel ID, such as "CFCP42RL7" (without <, >, or #
 * characters)
 * @param {string} text - Message to be posted
 * @param {string} user_id - Slack user ID (without <, >, or # characters) of the
 * requester
 * @param {string} ts - Timestamp of the mod message
 * @param {string} moderator - Slack user ID (without <, >, or # characters) of the
 * moderator taking action on the request
 */
const updateModMessage = (status, channel_id, text, user_id, ts, moderator) => {
  if (status == "cancelled") {
    update({
      token: TOKEN,
      channel: MOD_CHANNEL_ID,
      ts: ts,
      blocks: [genMarkdownSection(`:point_right: <@${user_id}>'s at-channel request *has been cancelled*.`)]
    });
    return;
  }
  // determine appropriate emoji for mod message based on action
  const emoji =
      status === "approved"
          ? ":heavy_check_mark:"
          : status === "approved without at-channel"
          ? ":heavy_minus_sign:"
          : ":x:";
  update({
    token: TOKEN,
    channel: MOD_CHANNEL_ID,
    ts: ts,
    blocks: [
      genMarkdownSection(`${emoji} The message:`),
      genMarkdownSection(`>>>${text}`),
      genMarkdownSection(`that <@${user_id}> requested to post in <#${channel_id}> has been *${status}* by <@${moderator}>.`)
    ]
  });
};

/**
 * Return a random emoji of based on sentiment. Emoji list in utilities/emojis.json
 *
 * @param {string} sentiment - One of "happy", "medium", "sad", or ""
 * @returns {string} Random emoji based on sentiment
 */
const randomEmoji = sentiment => {
  let emojis = [];
  const availableSentiments = Object.keys(emojisList);
  if (availableSentiments.indexOf(sentiment) !== -1) {
    emojis = emojisList[sentiment];
  } else {
    for (const s of availableSentiments) {
      emojis = emojis.concat(emojisList[s]);
    }
  }
  return emojis[Math.floor(Math.random() * emojis.length)];
};

module.exports = { isModerator, updateModMessage, randomEmoji, genMarkdownSection, genActionButton, extractSlackId, ackNext };
