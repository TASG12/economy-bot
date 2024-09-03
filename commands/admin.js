const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require("discord.js");
const profileModel = require("../models/profileSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("admin")
    .setDescription("Admin commands!")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Add coins to a user's balance!")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user to add the money to!")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setDescription("The amount of coins to add!")
            .setRequired(true)
            .setMinValue(1)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("subtract")
        .setDescription("Subtract coins from a user's balance!")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user to subtract the money from!")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setDescription("The amount of coins to subtract!")
            .setRequired(true)
            .setMinValue(1)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("say")
        .setDescription("Repeat a message as the bot!")
        .addStringOption((option) =>
          option
            .setName("message")
            .setDescription("The message to be repeated!")
            .setRequired(true)
        )
        .addChannelOption(
          (option) =>
            option
              .setName("channel")
              .setDescription("The channel to send the message to!")
              .setRequired(true)
              .addChannelTypes(ChannelType.GuildText) // Only allow text channels
        )
    ),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const adminSubCommand = interaction.options.getSubcommand();

    if (adminSubCommand === "add") {
      const user = interaction.options.getUser("user");
      const amount = interaction.options.getInteger("amount");

      await profileModel.findOneAndUpdate(
        {
          userId: user.id,
        },
        {
          $inc: {
            balance: amount,
          },
        }
      );

      await interaction.editReply(
        `Added $${amount} to ${user.username}'s balance!`
      );
    }

    if (adminSubCommand === "subtract") {
      const user = interaction.options.getUser("user");
      const amount = interaction.options.getInteger("amount");

      await profileModel.findOneAndUpdate(
        {
          userId: user.id,
        },
        {
          $inc: {
            balance: -amount,
          },
        }
      );

      await interaction.editReply(
        `Subtracted $${amount} from ${user.username}'s balance!`
      );
    }

    if (adminSubCommand === "say") {
      const message = interaction.options.getString("message");
      const channel = interaction.options.getChannel("channel");

      // Send the message as the bot in the specified channel
      await channel.send(message);

      // Send an ephemeral confirmation to the admin
      await interaction.editReply("Message sent!");
    }
  },
};
