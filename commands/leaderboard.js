const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require("@discordjs/builders");
const profileModel = require("../models/profileSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Shows the top 5 richest people in the server!"),
  async execute(interaction) {
    await interaction.deferReply();

    const { username, id } = interaction.user;

    // Create the embed
    const leaderboardEmbed = new EmbedBuilder()
      .setTitle("**Top 5 Richest Users!**")
      .setColor(0x45d6fd)
      .setFooter({ text: "You are not ranked yet!" });

    // Fetch and sort members by balance
    const members = await profileModel
      .find()
      .sort({ balance: -1 })
      .catch((err) => {
        console.log(err);
        return [];
      });

    // Find the index of the current user
    const memberIdx = members.findIndex((member) => member.userId === id);

    // Update footer with user's rank
    leaderboardEmbed.setFooter({
      text:
        memberIdx >= 0
          ? `${username}, you're rank #${memberIdx + 1} with $${
              members[memberIdx].balance
            }!`
          : `${username}, you're not ranked yet!`,
    });

    // Get the top 5 members
    const topFive = members.slice(0, 5);

    // Build the description with top 5 members
    let desc = "";
    for (let i = 0; i < topFive.length; i++) {
      try {
        let member = await interaction.guild.members.fetch(topFive[i].userId);
        if (member) {
          let userBalance = topFive[i].balance;
          desc += `**${i + 1}. ${member.user.username}:** $${userBalance}\n`;
        }
      } catch (error) {
        console.log(`Failed to fetch user ${topFive[i].userId}:`, error);
      }
    }

    // Set description if not empty
    if (desc !== "") {
      leaderboardEmbed.setDescription(desc);
    }

    // Send the embed
    await interaction.editReply({ embeds: [leaderboardEmbed] });
  },
};
