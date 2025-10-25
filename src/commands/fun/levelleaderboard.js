const {
  Client,
  Interaction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require("discord.js");
const levelHelper = require("../levelHelper");

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
      const levelsData = levelHelper.loadLevelData();

      const leaderboard = Object.entries(levelsData)
        .filter(([userId, data]) => data.level > 0 && guild.members.cache.has(userId))
        .sort((a, b) => b[1].level - a[1].level || b[1].xp - a[1].xp)
        .slice(0, 10);

      if (leaderboard.length === 0) {
        return interaction.editReply({
          content: "🎓 Nobody in this server has leveled up yet.",
          ephemeral: false,
        });
      }

      const description = leaderboard
        .map(([userId, data], index) => {
          return `**${index + 1}.** <@${userId}> — 🏆 **Level ${data.level}** | ✨ **${data.xp} XP**`;
        })
        .join("\n");

      const embed = new EmbedBuilder()
        .setColor("Orange")
        .setTitle("🎓 Level Leaderboard")
        .setDescription(description)
        .setFooter({
          text: `Requested by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("your_level")
          .setLabel("Your Level")
          .setStyle(ButtonStyle.Secondary)
      );

      const reply = await interaction.editReply({
        embeds: [embed],
        components: [row],
      });

      const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.Button,
      });

      collector.on("collect", async (i) => {
        if (i.customId !== "your_level") return;

        const userData = levelHelper.getUserLevel(i.user.id);

        const personalEmbed = new EmbedBuilder()
          .setColor("Orange")
          .setTitle("🎓 Your Level Info")
          .addFields(
            { name: "👤 User", value: `<@${i.user.id}>`, inline: true },
            { name: "🏆 Level", value: `\`${userData.level}\``, inline: true },
            { name: "✨ XP", value: `\`${userData.xp} / ${(userData.level + 1) * 25}\``, inline: true }
          )
          .setFooter({
            text: `Requested by ${i.user.tag}`,
            iconURL: i.user.displayAvatarURL({ dynamic: true }),
          })
          .setTimestamp();

        await i.reply({ embeds: [personalEmbed], ephemeral: true });
      });

    } catch (error) {
      console.error("Error handling levelleaderboard command:", error);
      await interaction.editReply({
        content: "An error occurred while fetching the level leaderboard.",
        ephemeral: false,
      });
    }
  },

  name: "levelleaderboard",
  description: "View the top 10 users with the highest level in the server.",
};
