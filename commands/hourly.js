const { SlashCommandBuilder } = require("discord.js");
const parseMilliseconds = require("parse-ms-2");
const profileModel = require("../models/profileSchema");
const { hourlyMin, hourlyMax } = require("../globalValues.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hourly")
    .setDescription("Redeem your hourly rewards!"),
  async execute(interaction, profileData) {
    const { id, username } = interaction.user;
    const { hourlyLastUsed } = profileData;

    const cooldown = 3600000; // 24 hours in milliseconds
    const timeLeft = cooldown - (Date.now() - hourlyLastUsed);

    if (timeLeft > 0) {
      await interaction.deferReply({ ephemeral: true });
      const { hours, minutes, seconds } = parseMilliseconds(timeLeft);
      await interaction.editReply(
        `Claim your next hourly in ${minutes} minutes and ${seconds} seconds!`
      );
      return; // Exit early if still in cooldown
    }

    await interaction.deferReply();

    const randomAmt = Math.floor(
      Math.random() * (hourlyMax - hourlyMin + 1) + hourlyMin
    );

    try {
      await profileModel.findOneAndUpdate(
        { userId: id },
        {
          $set: {
            hourlyLastUsed: Date.now(),
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
      `${username} has won $${randomAmt} from their hourly reward!`
    );
  },
};
