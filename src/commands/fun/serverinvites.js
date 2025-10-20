const {
    Client,
    Interaction,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
} = require("discord.js");

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
      const invites = await guild.invites.fetch();
      const totalInvites = invites.reduce((sum, invite) => sum + (invite.uses || 0), 0);
      const hasInvites = invites.size > 0;

      const embed = new EmbedBuilder()
        .setColor("Orange")
        .setTitle("🎃 Server Invite Tracker")
        .setDescription(`Here’s how many total invites **${guild.name}** has:`)
        .addFields({
          name: "🕸️ Total Invites",
          value: `\`${totalInvites}\` total uses`,
          inline: true,
        })
        .setFooter({
          text: `Requested by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("view_invites")
          .setLabel("View Invites")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(!hasInvites)
      );

      const reply = await interaction.editReply({
        embeds: [embed],
        components: [row],
      });

      if (!hasInvites) return;

      const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.Button,
      });

      collector.on("collect", async (i) => {
        if (i.customId !== "view_invites") return;

        if (i.user.id !== interaction.user.id) {
          return i.reply({
            content: "You can't view this command. Run `/serverinvites`.",
            ephemeral: true,
          });
        }

        const inviteList = invites
          .map(invite => `\`${invite.code}\` - ${invite.uses || 0}`)
          .join("\n");

        const listEmbed = new EmbedBuilder()
          .setColor("Orange")
          .setTitle("📜 Server Invite List")
          .setDescription(inviteList.length > 4096 ? inviteList.slice(0, 4093) + "..." : inviteList)
          .setFooter({
            text: `Requested by ${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
          })
          .setTimestamp();

        await i.reply({ embeds: [listEmbed], ephemeral: true });
      });

    } catch (error) {
      console.error("Error handling serverinvites command:", error);
      await interaction.editReply({
        content: "An error occurred while fetching server invites.",
        ephemeral: false,
      });
    }
  },

  name: "serverinvites",
  description: "Check how many total invites your server has.",
};
