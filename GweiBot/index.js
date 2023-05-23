const { Alchemy, Utils, Network } = require("alchemy-sdk");
const { Client, Events, GatewayIntentBits } = require("discord.js");
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

module.exports = async function (context, myTimer) {
  const discordToken = process.env.DISCORD_TOKEN;
  const CHANNEL_ID = "1068005248754532403"; // Channel ID to read from signup list
  const MESSAGE_ID = "1110430218713301032"; // message to read from emoji reactions
  let messageSent = false;
  const settings = {
    apiKey: process.env.ALCHEMY_API_KEY,
    network: Network.ETH_MAINNET,
  };

  client.on(Events.Error, async (e) => {
    console.log(e);
  });
  client.on(Events.ClientReady, async (c) => {
    await getGweiAndSendMessage();
  });

  await client.login(discordToken);
  if (client.isReady() == true && messageSent == false) {
    await getGweiAndSendMessage();
  }

  async function getGweiAndSendMessage() {
    const alchemy = new Alchemy(settings);
    const hexGwei = await alchemy.core.getGasPrice();
    const gwei = Utils.formatUnits(hexGwei, "gwei");
    if ((parseInt(gwei) < 45 || parseInt(gwei) > 80) && messageSent == false) {
      const channel = client.channels.cache.get(CHANNEL_ID);
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
            const followUpMessage = `${
              parseInt(gwei) < 45
                ? `AYOOOO gas is cheap (${parseInt(
                    gwei
                  )} gwei), get those rerolls in.`
                : `Gas is a little expensive right now (${parseInt(
                    gwei
                  )} gwei), wait a bit to reroll if you can.`
            } ${taggedUsers.join(", ")}`;

            // Send the follow-up message
            await reaction.message.channel.send(followUpMessage);
            messageSent = true;
          }
        });
      });
    }
  }
};
