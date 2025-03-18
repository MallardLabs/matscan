const { Client } = require("discord.js-selfbot-v13");
const { parseTransaction } = require("./embedParser");
const { createTransaction } = require("../models/transactionModels");

const client = new Client();
const config = require("../../config");
const userModel = require("../models/usersModels");
const logger = require("../../logger");

const startDiscordClient = (io) => {
  client.on("ready", () => {
    console.log(`${client.user.username} is ready!`);
  });

  client.on("messageCreate", async (message) => {
    if (!message.guild || !message.channel) return;

    // Validate guild and channel
    if (
      message.guild.id === config.guildId &&
      message.channel.id === config.channelId
    ) {
      if (message.embeds.length > 0 && message.embeds[0].description) {
        try {
          const parsed = parseTransaction(message.embeds[0]);

          // Emit transaction to clients
          io.emit("new_transaction", parsed);

          // Save transaction
          await createTransaction(
            parsed.txid,
            parsed.title,
            parsed.sender,
            parsed.receiver,
            parsed.amount,
            parsed.timestamp
          );
          logger.info(`Processed transaction: ${parsed.txid}`);

          // Update or add user
          if (parsed.receiverBalance) {
            const update = await userModel.updateUser(
              parsed.receiver,
              parsed.receiverBalance,
              0,
              parsed.timestamp
            );

            if (!update) {
              await userModel.addUser(
                parsed.receiver,
                parsed.receiverBalance,
                0,
                parsed.timestamp
              );
              logger.info(`Added new user: ${parsed.receiver}`);
            } else {
              logger.info(`Updated user: ${parsed.receiver}`);
            }
          }
        } catch (error) {
          logger.error(`Error processing message: ${error.message}`);
        }
      } else {
        console.log("No embed description found.");
      }
    }
  });

  client.login(config.discordToken).catch((err) => {
    console.error("Failed to login to Discord:", err);
  });
};

module.exports = {
  startDiscordClient,
};
