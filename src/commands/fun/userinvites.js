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

      const targetUser = interaction.options.getUser("user") || interaction.user;
      const guild = interaction.guild;
      const invites = await guild.invites.fetch();
      const userInvites = invites.filter(invite => invite.inviter && invite.inviter.id === targetUser.id);
      const totalUserInvites = userInvites.reduce((sum, invite) => sum + (invite.uses || 0), 0);
      const hasInvites = userInvites.size > 0;

      const embed = new EmbedBuilder()
        .setColor("Orange")
        .setTitle("🍭 User Invite Tracker")
        .setDescription(`Here’s how many people joined using <@${targetUser.id}>’s invites:`)
        .addFields({
          name: "🍬 Total Invites",
          value: `\`${totalUserInvites}\` total uses`,
          inline: true,
        })
        .setFooter({
          text: `Requested by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("view_user_invites")
          .setLabel("View User Invites")
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
        if (i.customId !== "view_user_invites") return;

        if (i.user.id !== interaction.user.id) {
          return i.reply({
            content: "You can't view this command. Run `/userinvites`.",
            ephemeral: true,
          });
        }

        const inviteList = userInvites
          .map(invite => `\`${invite.code}\` - ${invite.uses || 0}`)
          .join("\n");

        const listEmbed = new EmbedBuilder()
          .setColor("Orange")
          .setTitle(`📜 ${targetUser.username}'s Invite List`)
          .setDescription(inviteList.length > 4096 ? inviteList.slice(0, 4093) + "..." : inviteList)
          .setFooter({
            text: `Requested by ${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
          })
          .setTimestamp();

        await i.reply({ embeds: [listEmbed], ephemeral: true });
      });

    } catch (error) {
      console.error("Error handling userinvites command:", error);
      await interaction.editReply({
        content: "An error occurred while fetching user invite data.",
        ephemeral: true,
      });
    }
  },

  name: "userinvites",
  description: "Check how many total invites a specific user has.",
  options: [
    {
      name: "user",
      description: "The user to check invites for.",
      type: 6,
      required: true,
    },
  ],
};
