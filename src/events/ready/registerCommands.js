const chalk = require("chalk");
const dayjs = require("dayjs");
const { testServer } = require("../../../config.json");
const areCommandsDifferent = require("../../utils/areCommandsDifferent");
const getApplicationCommands = require("../../utils/getApplicationCommands");
const getLocalCommands = require("../../utils/getLocalCommands");

module.exports = async (client) => {
  try {
    const timestamp = () => chalk.gray(`[${dayjs().format("HH:mm:ss")}]`);
    const localCommands = getLocalCommands();
    const appCommands = await getApplicationCommands(client, testServer);

    for (const localCommand of localCommands) {
      const { name, description, options, deleted } = localCommand;
      const existingCommand = appCommands.cache.find((cmd) => cmd.name === name);

      if (deleted) {
        if (existingCommand) {
          await appCommands.delete(existingCommand.id);
          console.log(`${timestamp()} 🗑️ ${chalk.red(`Deleted command:`)} ${chalk.bold(name)}`);
        } else {
          console.log(`${timestamp()} ⏩ ${chalk.yellow(`Skipped`)} "${name}" (marked for deletion)`);
        }
        continue;
      }

      if (existingCommand) {
        if (areCommandsDifferent(existingCommand, localCommand)) {
          await appCommands.edit(existingCommand.id, { description, options });
          console.log(`${timestamp()} 🔁 ${chalk.cyan(`Updated command:`)} ${chalk.bold(name)}`);
        }
      } else {
        await appCommands.create({ name, description, options });
        console.log(`${timestamp()} ✅ ${chalk.green(`Registered command:`)} ${chalk.bold(name)}`);
      }
    }

    console.log(`${timestamp()} 🌐 ${chalk.green.bold("Command registration completed successfully!")}`);

  } catch (error) {
    console.log(`${chalk.red.bold("❌ Error during command registration:")}\n${error.stack || error}`);
  }
};
