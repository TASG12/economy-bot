const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Lists all commands and their descriptions."),
  async execute(interaction) {
    // Create an embed for the help command
    const helpEmbed = new EmbedBuilder()
      .setColor(0x0099ff) // Set the embed color
      .setTitle("Command List")
      .setDescription(
        "Here are all the available commands, categorized by function:"
      )
      .addFields(
        // Admin Commands
        {
          name: "__**Admin Commands**__",
          value: "Commands restricted to administrators.",
          inline: false,
        },
        {
          name: "/admin add",
          value: "Add money to a user (Admin Only)",
          inline: true,
        },
        {
          name: "/admin say",
          value: "Make the bot say something (Admin Only)",
          inline: true,
        },
        {
          name: "/admin subtract",
          value: "Subtract coins from a user (Admin Only)",
          inline: true,
        },

        // User Balance Commands
        {
          name: "__**Money Commands**__",
          value: "Commands to do with money.",
          inline: false,
        },
        { name: "/balance", value: "Show a user's balance.", inline: true },
        { name: "/donate", value: "Give money to another user.", inline: true },
        {
          name: "/leaderboard",
          value: "Show the top 5 richest people in the server.",
          inline: true,
        },

        // Reward Commands
        {
          name: "__**Reward Commands**__",
          value: "Commands to do with being rewarded money.",
          inline: false,
        },
        { name: "/daily", value: "Redeem your daily rewards.", inline: true },
        { name: "/hourly", value: "Redeem your hourly rewards.", inline: true },

        // Gambling Commands
        {
          name: "__**Gambling Commands**__",
          value: "Commands where you gamble.",
          inline: false,
        },
        {
          name: "/gamble coinflip",
          value:
            "Pick either heads or tails. If you choose correctly, you earn $25.",
          inline: true,
        },
        {
          name: "/gamble three-doors",
          value:
            "Pick between 3 doors: either double your bet, lose half your bet, or lose all your bet.",
          inline: true,
        },

        // Miscellaneous Commands
        {
          name: "__**Miscellaneous Commands**__",
          value: "Any other commands.",
          inline: false,
        },
        { name: "/ping", value: "Replies with pong.", inline: true }
      )
      .setFooter({ text: "Use these commands to interact with the bot!" });

    // Send the embed as a public response to the interaction
    await interaction.reply({ embeds: [helpEmbed], ephemeral: false });
  },
};
