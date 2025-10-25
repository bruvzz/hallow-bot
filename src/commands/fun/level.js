const {
  Client,
  Interaction,
  EmbedBuilder,
  ApplicationCommandOptionType,
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

      const targetUser = interaction.options.getUser("user") || interaction.user;
      const userData = levelHelper.getUserLevel(targetUser.id);

      const embed = new EmbedBuilder()
        .setColor("Orange")
        .setTitle(`🎓 ${targetUser.username}'s Level Info`)
        .addFields(
          { name: "👤 User", value: `<@${targetUser.id}>`, inline: true },
          { name: "🏆 Level", value: `\`${userData.level}\``, inline: true },
          { name: "✨ XP", value: `\`${userData.xp} / ${(userData.level + 1) * 25}\``, inline: true }
        )
        .setFooter({
          text: `Requested by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error handling /level command:", error);
      await interaction.editReply({
        content: "An error occurred while fetching the level information.",
        ephemeral: true,
      });
    }
  },

  name: "level",
  description: "Check your level or another user's level.",
  options: [
    {
      name: "user",
      description: "The user to check the level for.",
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ],
};
