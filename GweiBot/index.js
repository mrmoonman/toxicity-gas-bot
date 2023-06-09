const { Alchemy, Utils, Network } = require("alchemy-sdk");
const { Client, Events, GatewayIntentBits } = require("discord.js");
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

module.exports = async function (context, myTimer) {
  context.log("here's our custom log for this baby lets go");
  const discordToken = process.env["DISCORD_TOKEN"];
  const CHANNEL_ID = process.env["CHANNEL_ID"]; // Channel ID to read from signup list
  const MESSAGE_ID = process.env["MESSAGE_ID"]; // message to read from emoji reactions
  let messageSent = false;

  context.log(discordToken);
  context.log(CHANNEL_ID);
  context.log(MESSAGE_ID);
  const settings = {
    apiKey: process.env["ALCHEMY_API_KEY"],
    network: Network.ETH_MAINNET,
  };

  client.on(Events.Error, async (e) => {
    context.log("ayo wtf this an error");
    context.error(JSON.stringify(e));
    context.log(e);
  });
  //cold starts
  client.on(Events.ClientReady, async (c) => {
    context.log("Client is ready");
    var success = await getGweiAndSendMessage();
    context.log(success);
  });

  context.log("Logging In");
  var loginResponse = await client.login(discordToken);
  context.log(loginResponse);
  //if client is already ready just send it bro

  context.log(
    `Client is ready: ${client.isReady()}, messageSent: ${messageSent}`
  );
  if ((client.isReady() == true || loginResponse === discordToken) && messageSent == false) {
    var success = await getGweiAndSendMessage();
    context.log(success);
  }

  async function getGweiAndSendMessage() {
    context.log("Getting gwei");
    const alchemy = new Alchemy(settings);
    const hexGwei = await alchemy.core.getGasPrice();
    const gwei = Utils.formatUnits(hexGwei, "gwei");
    context.log(`gwei is ${gwei}`);
    if ((parseInt(gwei) < 45 || parseInt(gwei) > 80) && messageSent == false) {
      const channel = client.channels.cache.get(CHANNEL_ID);
      channel.messages.fetch(MESSAGE_ID).then(async (message) => {
        message.reactions.cache.each(async (reaction) => {
          // Check if the reaction matches the specified emoji
          if (reaction.emoji.name === "🧪") {
            context.log("get that reaction tho");
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

            // clear previous and send new message
            await cleanupPreviousMessages(channel);
            await reaction.message.channel.send(followUpMessage);
            messageSent = true;
            return messageSent;
          }
        });
      });
      return false;
    }
  }
  setTimeout(() => {
    context.log("aight nah man, delayed 4 seconds");
  }, 4000);
  async function cleanupPreviousMessages(channel) {
    const messages = await channel.messages.fetch();
    const filteredMessages = messages.filter(
      (x) => x.author.id === "1110427816341819502"
    );

    await channel.bulkDelete(filteredMessages, true);
  }
};
