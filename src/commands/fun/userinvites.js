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

      const targetUser = interaction.options.getUser("user") || interaction.user;
      const invitesData = loadInvites();
      const userInvites = invitesData[targetUser.id] || [];
      const totalUserInvites = userInvites.length;

      const embed = new EmbedBuilder()
        .setColor("Orange")
        .setTitle(`🍭 User Invite Tracker`)
        .setDescription(`Here’s how many **users** joined using <@${targetUser.id}>'s invites:`)
        .addFields({ name: "🍬 Total Invites", value: `\`${totalUserInvites}\` invites`, inline: true })
        .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("view_user_invites")
          .setLabel("View Users Invited")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(userInvites.length === 0)
      );

      const reply = await interaction.editReply({ embeds: [embed], components: [row] });
      if (userInvites.length === 0) return;

      const collector = reply.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

      collector.on("collect", async (i) => {
        if (i.customId !== "view_user_invites") return;
        if (i.user.id !== interaction.user.id) return i.reply({ content: "You can't view this command.", ephemeral: true });

        const listEmbed = new EmbedBuilder()
          .setColor("Orange")
          .setTitle(`📜 Users invited by ${targetUser.username}`)
          .setDescription(userInvites.map(id => `<@${id}>`).join("\n").slice(0, 4096))
          .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
          .setTimestamp();

        await i.reply({ embeds: [listEmbed], ephemeral: true });
      });

    } catch (error) {
      console.error("Error handling userinvites command:", error);
      await interaction.editReply({ content: "An error occurred while fetching user invite data.", ephemeral: true });
    }
  },

  name: "userinvites",
  description: "Check how many unique invites a specific user has.",
  options: [
    { 
      name: "user", 
      description: "The user to check invites for.", 
      type: 6, 
      required: false 
    },
  ],
};
