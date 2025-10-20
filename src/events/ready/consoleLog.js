const chalk = require("chalk");
const dayjs = require("dayjs");

module.exports = (client) => {
    const timestamp = dayjs().format("YYYY-MM-DD HH:mm:ss");
    const tag = chalk.cyan.bold(client.user.tag);
    const status = chalk.green.bold("Online");

    console.log(
        chalk.gray(`[${timestamp}] `) +
        chalk.blue.bold("[READY] ") +
        `${tag} is now ${status}.`
    );
};
