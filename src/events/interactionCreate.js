module.exports = {
  name: "interactionCreate",
  
  callback: async (client, interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const localCommands = require("../utils/getLocalCommands");
    const getApplicationCommands = require("../utils/getApplicationCommands");

    const local = localCommands();
    const appCommands = await getApplicationCommands(client);

    const commandObject = local.find(cmd => cmd.name === interaction.commandName);

    if (!commandObject) {
      console.log(`⚠️ Command ${interaction.commandName} not found locally.`);
      return;
    }

    try {
      await commandObject.callback(client, interaction);
    } catch (err) {
      console.error(`❌ Error executing /${interaction.commandName}:`, err);
      if (!interaction.replied) {
        await interaction.reply({
          content: "⚠️ There was an error executing this command.",
          ephemeral: true,
        });
      }
    }
  },
};
