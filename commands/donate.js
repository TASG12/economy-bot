const { SlashCommandBuilder } = require("discord.js");
const profileModel = require("../models/profileSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("donate")
    .setDescription("Donate money to other users!")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user you want to donate to!")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("The amount of money to donate!")
        .setRequired(true)
        .setMinValue(1)
    ),
  async execute(interaction, profileData) {
    const receiveUser = interaction.options.getUser("user");
    const donateAmt = interaction.options.getInteger("amount");

    const { balance } = profileData;

    // Check if the donor has enough balance
    if (balance < donateAmt) {
      await interaction.deferReply({ ephemeral: true });
      return await interaction.editReply(
        `You do not have $${donateAmt} in your wallet!`
      );
    }

    // Update the recipient's balance
    const receiveUserData = await profileModel.findOneAndUpdate(
      {
        userId: receiveUser.id,
      },
      {
        $inc: {
          balance: donateAmt,
        },
      },
      { new: true } // Return the updated document
    );

    if (!receiveUserData) {
      await interaction.deferReply({ ephemeral: true });
      return await interaction.editReply(
        `<@${receiveUser.id}> is not in the bot's database!`
      );
    }

    // Update the donor's balance
    await profileModel.findOneAndUpdate(
      {
        userId: interaction.user.id,
      },
      {
        $inc: {
          balance: -donateAmt,
        },
      }
    );

    // Confirm the donation
    await interaction.deferReply();
    await interaction.editReply(
      `<@${interaction.user.id}> has donated $${donateAmt} to <@${receiveUser.id}>!`
    );
  },
};
