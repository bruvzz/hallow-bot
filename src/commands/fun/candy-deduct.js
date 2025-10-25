const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  EmbedBuilder,
} = require("discord.js");
const fs = require("fs");
const path = require("path");

const candyDBPath = path.resolve(__dirname, "../candy.json");

const authorizedUsers = [
  "1367846972358135890"
];

function loadCandyData() {
  if (!fs.existsSync(candyDBPath)) return {};
  return JSON.parse(fs.readFileSync(candyDBPath, "utf8"));
}

function saveCandyData(data) {
  fs.writeFileSync(candyDBPath, JSON.stringify(data, null, 2));
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

      if (!authorizedUsers.includes(interaction.user.id)) {
        return interaction.editReply({
          content: "🚫 You are not authorized to use this command.",
          ephemeral: true,
        });
      }

      const targetId = interaction.options.getString("userid");
      const amount = interaction.options.getInteger("amount");

      if (!targetId || amount === null) {
        return interaction.editReply({
          content: "🚫 Please provide both a valid **User ID** and **amount**.",
          ephemeral: true,
        });
      }

      const candyData = loadCandyData();

      if (!candyData[targetId]) {
        candyData[targetId] = {
          invites: 0,
          candy: 0,
        };
      }

      candyData[targetId].candy = Math.max(0, candyData[targetId].candy - amount);
      saveCandyData(candyData);

      const embed = new EmbedBuilder()
        .setColor("Orange")
        .setTitle("🍫 Candy Deducted")
        .setDescription(`Successfully deducted 🍬 **${amount} candy points** from <@${targetId}>.`)
        .addFields(
          { name: "👤 Target User", value: `<@${targetId}> (\`${targetId}\`)`, inline: true },
          { name: "🍭 Candy Deducted", value: `\`${amount}\``, inline: true },
          { name: "🍬 Total Candy", value: `\`${candyData[targetId].candy}\``, inline: true }
        )
        .setFooter({
          text: `Deducted by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error("Error handling candy-deduct command:", error);
      await interaction.editReply({
        content: "An error occurred while deducting candy points.",
        ephemeral: true,
      });
    }
  },

  name: "candy-deduct",
  description: "Manually deduct candy points from a user by ID.",
  options: [
    {
      name: "userid",
      description: "The user of the person to deduct candy from.",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "amount",
      description: "The amount of candy to deduct.",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
  ],
};
