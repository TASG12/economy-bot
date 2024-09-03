const { SlashCommandBuilder } = require("discord.js");
const parseMilliseconds = require("parse-ms-2");
const profileModel = require("../models/profileSchema");
const { dailyMin, dailyMax } = require("../globalValues.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Redeem your daily rewards!"),
  async execute(interaction, profileData) {
    const { id, username } = interaction.user;
    const { dailyLastUsed } = profileData;

    const cooldown = 86400000; // 24 hours in milliseconds
    const timeLeft = cooldown - (Date.now() - dailyLastUsed);

    if (timeLeft > 0) {
      await interaction.deferReply({ ephemeral: true });
      const { hours, minutes, seconds } = parseMilliseconds(timeLeft);
      await interaction.editReply(
        `Claim your next daily in ${hours} hours, ${minutes} minutes and ${seconds} seconds!`
      );
      return; // Exit early if still in cooldown
    }

    await interaction.deferReply();

    const randomAmt = Math.floor(
      Math.random() * (dailyMax - dailyMin + 1) + dailyMin
    );

    try {
      await profileModel.findOneAndUpdate(
        { userId: id },
        {
          $set: {
            dailyLastUsed: Date.now(),
          },
          $inc: {
            balance: randomAmt,
          },
        }
      );
    } catch (err) {
      console.log(err);
    }

    await interaction.editReply(
      `${username} has won $${randomAmt} from their daily reward!`
    );
  },
};
