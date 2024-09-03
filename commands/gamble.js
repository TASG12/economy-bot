const { SlashCommandBuilder, ButtonStyle } = require("discord.js");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
} = require("@discordjs/builders");
const profileModel = require("../models/profileSchema");
const { coinflipReward } = require("../globalValues.json");
const parseMilliseconds = require("parse-ms-2");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("gamble")
    .setDescription("Gamble your life savings away!")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("three-doors")
        .setDescription("You can double, half, or lose your money")
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setDescription("Amount you want to gamble!")
            .setMinValue(2)
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("coinflip")
        .setDescription(
          "Flip a coin! Either double your money or lose it all..."
        )
        .addStringOption((option) =>
          option
            .setName("choice")
            .setDescription("Heads or tails?")
            .setRequired(true)
            .addChoices(
              { name: "Heads", value: "Heads" },
              { name: "Tails", value: "Tails" }
            )
        )
    ),
  async execute(interaction) {
    const { username, id } = interaction.user;

    // Fetch profile data
    const profileData = await profileModel.findOne({ userId: id });
    if (!profileData) {
      await interaction.reply("Profile not found.");
      return;
    }

    const balance = profileData.balance;
    const gambleCommand = interaction.options.getSubcommand();

    if (gambleCommand === "three-doors") {
      const amount = interaction.options.getInteger("amount");

      if (balance < amount) {
        await interaction.deferReply({ ephemeral: true });
        return await interaction.editReply(
          `You don't have $${amount} to gamble with!`
        );
      }

      await interaction.deferReply();

      const Button1 = new ButtonBuilder()
        .setCustomId("one")
        .setLabel("Door 1")
        .setStyle(ButtonStyle.Primary);

      const Button2 = new ButtonBuilder()
        .setCustomId("two")
        .setLabel("Door 2")
        .setStyle(ButtonStyle.Primary);

      const Button3 = new ButtonBuilder()
        .setCustomId("three")
        .setLabel("Door 3")
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(
        Button1,
        Button2,
        Button3
      );

      const gambleEmbed = new EmbedBuilder()
        .setColor(0x00aa6d)
        .setTitle(`Playing three doors for $${amount}!`)
        .setFooter({
          text: "Each door has DOUBLE COINS, LOSE HALF, or LOSE ALL",
        });

      await interaction.editReply({ embeds: [gambleEmbed], components: [row] });

      const message = await interaction.fetchReply();

      const filter = (i) => i.user.id === interaction.user.id;

      const collector = message.createMessageComponentCollector({
        filter,
        time: 60000,
      });

      const double = "DOUBLE COINS";
      const half = "LOSE HALF";
      const lose = "LOSE ALL";

      const getAmount = (label, gamble) => {
        let amount = -gamble;
        if (label === double) {
          amount = gamble;
        } else if (label === half) {
          amount = -Math.round(gamble / 2);
        }
        return amount;
      };

      let choice = null;

      collector.on("collect", async (i) => {
        let options = [Button1, Button2, Button3];

        const randInxDouble = Math.floor(Math.random() * 3);
        const doubleButton = options.splice(randInxDouble, 1)[0];
        doubleButton.setLabel(double).setDisabled(true);

        const randomIdxHalf = Math.floor(Math.random() * 2);
        const halfButton = options.splice(randomIdxHalf, 1)[0];
        halfButton.setLabel(half).setDisabled(true);

        const zeroButton = options[0];
        zeroButton.setLabel(lose).setDisabled(true);

        Button1.setStyle(ButtonStyle.Secondary);
        Button2.setStyle(ButtonStyle.Secondary);
        Button3.setStyle(ButtonStyle.Secondary);

        if (i.customId === "one") choice = Button1;
        else if (i.customId === "two") choice = Button2;
        else if (i.customId === "three") choice = Button3;

        choice.setStyle(ButtonStyle.Success);

        const label = choice.data.label;
        const amtChange = getAmount(label, amount);

        await profileModel.findOneAndUpdate(
          {
            userId: id,
          },
          {
            $inc: {
              balance: amtChange,
            },
          }
        );

        if (label === double) {
          gambleEmbed
            .setTitle("DOUBLED! You just doubled your gamble!")
            .setFooter({ text: `${username} gained $${amtChange}!` });
        } else if (label === half) {
          gambleEmbed
            .setTitle("LOST HALF! You just lost half of your gamble!")
            .setFooter({ text: `${username} lost $${-amtChange}!` });
        } else if (label === lose) {
          gambleEmbed
            .setTitle("LOST ALL! You just lost all of your gamble!")
            .setFooter({ text: `${username} lost $${-amtChange}!` });
        }

        await i.update({ embeds: [gambleEmbed], components: [row] });
        collector.stop();
      });
    } else if (gambleCommand === "coinflip") {
      const { coinflipLastUsed } = profileData;

      const cooldown = 120000; // 2 min
      const timeLeft = cooldown - (Date.now() - coinflipLastUsed);

      if (timeLeft > 0) {
        await interaction.deferReply({ ephemeral: true });
        const { minutes, seconds } = parseMilliseconds(timeLeft);
        return await interaction.editReply(
          `Do a coinflip again in ${minutes} minutes and ${seconds} seconds!`
        );
      }

      await interaction.deferReply();

      await profileModel.findOneAndUpdate(
        {
          userId: id,
        },
        {
          $set: {
            coinflipLastUsed: Date.now(),
          },
        }
      );

      const randomNum = Math.round(Math.random());
      const result = randomNum ? "Heads" : "Tails";
      const choice = interaction.options.getString("choice");

      if (choice === result) {
        await profileModel.findOneAndUpdate(
          {
            userId: id,
          },
          {
            $inc: {
              balance: coinflipReward,
            },
          }
        );

        await interaction.editReply(
          `Winner! You won $${coinflipReward} with **${choice}**`
        );
      } else {
        await interaction.editReply(
          `You lost! You chose **${choice}** but it was **${result}**`
        );
      }
    }
  },
};
