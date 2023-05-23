const { Alchemy, Utils, Network } = require("alchemy-sdk");
const { Client, Events, GatewayIntentBits } = require("discord.js");
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

module.exports = async function (context, myTimer) {
  console.log("leggo");
  const discordToken = process.env.DISCORD_TOKEN;
  client.login(discordToken);

  const CHANNEL_ID = "1068005248754532403"; // Channel ID to read from signup list
  const MESSAGE_ID = "1110430218713301032"; // message to read from emoji reactions
  client.on(Events.Error, async (e) => {
    console.log(e);
  });
  client.on(Events.ClientReady, async (c) => {
    console.log("connected");
    const settings = {
      apiKey: process.env.ALCHEMY_API_KEY,
      network: Network.ETH_MAINNET,
    };

    const alchemy = new Alchemy(settings);
    const hexGwei = await alchemy.core.getGasPrice();
    const gwei = Utils.formatUnits(hexGwei, "gwei");
    if (parseInt(gwei) < 200) {
      console.log("yeah we cheap");
      const channel = client.channels.cache.get(CHANNEL_ID);
      console.log(JSON.stringify(channel));
      channel.messages.fetch(MESSAGE_ID).then(async (message) => {
        message.reactions.cache.each(async (reaction) => {
          // Check if the reaction matches the specified emoji
          if (reaction.emoji.name === "🧪") {
            console.log("get that reaction tho");
            // Iterate through the users who reacted with the emoji
            const users = await reaction.users.fetch();

            // Convert the collection to an array of user IDs
            const userIDs = users.map((user) => user.id);

            const taggedUsers = userIDs.map((userID) => `<@${userID}>`);
            const followUpMessage = `AYOOOO Gas is cheap, ${parseInt(
              gwei
            )} to be exact. ${taggedUsers.join(", ")}`;

            // Send the follow-up message
            reaction.message.channel.send(followUpMessage);

            context.done();
          }
        });
      });
    }
  });
};
