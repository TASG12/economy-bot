const { SlashCommandBuilder } = require("discord.js");
const profileModel = require("../models/profileSchema"); // Import your profile schema

module.exports = {
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Shows the balance of a user.")
    .addUserOption(
      (option) =>
        option
          .setName("user")
          .setDescription("The user whose balance you want to check.")
          .setRequired(true) // Make the user option required
    ),
  async execute(interaction) {
    try {
      // Get the user to check balance for
      const targetUser = interaction.options.getUser("user");
      const userId = targetUser.id;
      const username = targetUser.username;

      // Fetch profile data for the specified user
      const profileData = await profileModel.findOne({ userId });

      if (!profileData) {
        await interaction.reply(`No profile data found for ${username}.`);
        return;
      }

      const { balance } = profileData;

      // Reply with the balance of the user
      await interaction.reply(`${username} has $${balance}!`);
    } catch (error) {
      console.error("Error executing command:", error);
      await interaction.reply("There was an error executing the command.");
    }
  },
};
