const {
  Client,
  Interaction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require("discord.js");
const fs = require("fs");
const path = require("path");

const candyDBPath = path.resolve(__dirname, "../candy.json");

function loadCandyData() {
  if (!fs.existsSync(candyDBPath)) return {};
  return JSON.parse(fs.readFileSync(candyDBPath, "utf8"));
}

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    try {
      await interaction.deferReply({ ephemeral: false });

      const guild = interaction.guild;
      const candyData = loadCandyData();
      await guild.members.fetch();

      const leaderboard = Object.entries(candyData)
        .filter(([userId, data]) => data.candy && data.candy > 0 && guild.members.cache.has(userId))
        .sort((a, b) => b[1].candy - a[1].candy)
        .slice(0, 10);

      if (leaderboard.length === 0) {
        return interaction.editReply({
          content: "🍬 Nobody in this server has earned any candy yet.",
          ephemeral: false,
        });
      }

      const description = leaderboard
        .map(([userId, data], index) => {
            return `**${index + 1}.** <@${userId}> — 🍭 **${data.candy} Candy**`;
        })
        .join("\n");

      const embed = new EmbedBuilder()
        .setColor("Orange")
        .setTitle("🎃 Candy Leaderboard 🍬")
        .setDescription(description)
        .setFooter({
          text: `Requested by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("your_candy")
          .setLabel("Your Candy")
          .setStyle(ButtonStyle.Secondary)
      );

      const reply = await interaction.editReply({
        embeds: [embed],
        components: [row],
      });

      const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 60000,
      });

      collector.on("collect", async (i) => {
        if (i.customId !== "your_candy") return;

        if (i.user.id !== interaction.user.id) {
          return i.reply({
            content: "You can only view your own candy count!",
            ephemeral: true,
          });
        }

        const userId = i.user.id;
        const userCandy = candyData[userId]?.candy || 0;

        const personalEmbed = new EmbedBuilder()
          .setColor("Orange")
          .setTitle("🍬 Your Candy Points")
          .setDescription(`You currently have 🍬 **${userCandy} candy points**!`)
          .setFooter({
            text: `Requested by ${i.user.tag}`,
            iconURL: i.user.displayAvatarURL({ dynamic: true }),
          })
          .setTimestamp();

        await i.reply({ embeds: [personalEmbed], ephemeral: true });
      });

      collector.on("end", async () => {
        const disabledRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("your_candy")
            .setLabel("Your Candy")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true)
        );

        await interaction.editReply({ embeds: [embed], components: [disabledRow] });
      });
    } catch (error) {
      console.error("Error handling candyleaderboard command:", error);
      await interaction.editReply({
        content: "An error occurred while fetching the candy leaderboard.",
        ephemeral: false,
      });
    }
  },

  name: "candyleaderboard",
  description: "View the top 10 users with the most candy in the server.",
};
