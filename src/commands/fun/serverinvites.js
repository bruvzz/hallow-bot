const {
  Client,
  Interaction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require("discord.js");
const { loadInvites } = require("../invitesHelper");

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
      const invitesData = loadInvites();

      let totalInvites = 0;
      for (const userId in invitesData) totalInvites += invitesData[userId].length;

      const embed = new EmbedBuilder()
        .setColor("Orange")
        .setTitle("🎃 Server Invite Tracker")
        .setDescription(`Here’s how many invites **${guild.name}** has:`)
        .addFields({ name: "🕸️ Total Invites", value: `\`${totalInvites}\` invites`, inline: true })
        .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      const hasInvites = totalInvites > 0;

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("view_server_invites")
          .setLabel("View Invites")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(!hasInvites)
      );

      const reply = await interaction.editReply({ embeds: [embed], components: [row] });
      if (!hasInvites) return;

      const collector = reply.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

      collector.on("collect", async (i) => {
        if (i.customId !== "view_server_invites") return;
        if (i.user.id !== interaction.user.id) return i.reply({ content: "You can't view this command.", ephemeral: true });

        const inviteList = Object.entries(invitesData)
          .map(([inviterId, users]) => `<@${inviterId}> - ${users.length} invite(s)`)
          .join("\n");

        const listEmbed = new EmbedBuilder()
          .setColor("Orange")
          .setTitle("📜 Server Invite List")
          .setDescription(inviteList.length > 4096 ? inviteList.slice(0, 4093) + "..." : inviteList)
          .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
          .setTimestamp();

        await i.reply({ embeds: [listEmbed], ephemeral: true });
      });

    } catch (error) {
      console.error("Error handling serverinvites command:", error);
      await interaction.editReply({ content: "An error occurred while fetching server invites.", ephemeral: true });
    }
  },

  name: "serverinvites",
  description: "Check how many total invites your server has.",
};
