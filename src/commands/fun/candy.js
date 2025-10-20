const { 
    Client, 
    Interaction, 
    EmbedBuilder, 
} = require("discord.js");
const { getCandy } = require("../candyHelper");

module.exports = {
  /**
   * 
   * @param {Client} client 
   * @param {Interaction} interaction 
   */
  callback: async (client, interaction) => {
    try {
      const targetUser = interaction.options.getUser("user") || interaction.user;
      const candyAmount = getCandy(targetUser.id);

      const embed = new EmbedBuilder()
        .setColor("Orange")
        .setTitle("🍬 Candy Points")
        .setDescription(`<@${targetUser.id}> has **${candyAmount} 🍬 candy points**!`)
        .setFooter({
          text: `Requested by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Error handling candy command:", error);
      await interaction.reply({ content: "An error occurred.", ephemeral: true });
    }
  },

  name: "candy",
  description: "Check your candy points or another user's candy points.",
  options: [
    {
      name: "user",
      description: "The user to check",
      type: 6,
      required: false
    }
  ]
};
