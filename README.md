[![Build Status](https://cloud.drone.io/api/badges/rpiambulance/at-channel/status.svg)](https://cloud.drone.io/rpiambulance/at-channel)

[![forthebadge](https://forthebadge.com/images/badges/built-with-love.svg)](https://forthebadge.com) [![forthebadge](https://forthebadge.com/images/badges/made-with-javascript.svg)](https://forthebadge.com)

# at-channel

**at-channel** is a Slack integration that allows admins to turn _off_ their @channel permissions in a Slack workspace, while allowing a team of admins and moderators to approve or reject requests from any member.

## Integration mechanics

The integration allows members to request messages by typing `/channel <message here>`. If the request is made from a locked channel (found in `handlers/slashCommands.js`), the request is put through to the #at-channel-requests channel, where moderators can review it.

### What happens after a request is made?

So, as said, if a `/channel` request is made from a non-open channel, a request is sent to the mods' channel for review. An ephemeral message is sent to the requesting user at the location of their request saying "Thanks!," and a direct message is sent to them, as well. This DM allows the requester to cancel their request, which notifies the mods' channel accordingly.

If, though, the request is placed in an open channel, it is immediately sent to the channel—no ephemeral messages, cancellation options, or request-for-approval placed.

### Moderation

To gain permissions to review `/channel` requests, a user must be a part of the @admins or @mods Slack user group for their particular workspace. By default, admins can approve all requests, while mods can approve all but their own. Collectively, we call the entire review team "moderators" or "mods," though programatically, they are different roles.

**at-channel** was designed for transparency, and we suggest keeping #at-channel-requests as an open channel. All previous requests are saved as messages, and it is noted who sent a particular request, as well as which moderator approved or denied the request.

## Configuration

Setting up **at-channel** is pretty easy, requiring a few things configured on Slack, and a few environment variables set on your server's side.

### Slack-side config

Head over to Slack's [app portal](https://api.slack.com/apps) and create a new app. You're going to want to make sure you set up "interactive components" as well as "slash commands." Furthermore, we use OAuth tokens for authentication; make sure your app has `bot`, `commands`, and `usergroups:read` scopes before installing the app to your workspace.

### Environment variables

Using what you just set up on Slack, you now need to set up the server's environment variables. At this point, you should've cloned this repo to your server and run `npm i` to get all the packages squared away. Next, copy or rename the `.env.example` file to `.env`, and open it up. Fill out the fields accordingly (you will need a bunch of the information from Slack's app portal). When that's done, running `nodemon server.js` or running the server in whatever other way you choose should work!

### Developer documentation
To regenerate jsdoc files use:
`jsdoc -R README.md -d docs/ handlers/*.js utilities/*.js server.js`

## Credits

### Developers

- [Dan Bruce](https://github.com/ddbruce)
- [Logan Ramos](https://github.com/lramos15)

### License

**at-channel** is provided under the [MIT License](https://opensource.org/licenses/MIT).

### Contact

For any question, comments, or concerns, email [dev@rpiambulance.com](mailto:dev@rpiambulance.com), [create an issue](https://github.com/rpiambulance/at-channel/issues/new), or open up a pull request.
