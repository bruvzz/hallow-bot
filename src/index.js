require("dotenv").config();
const { 
    Client, 
    IntentsBitField,
} = require("discord.js");
const chalk = require("chalk");
const dayjs = require("dayjs");
const eventHandler = require("./handlers/eventHandler");

const timestamp = () => chalk.gray(`[${dayjs().format("HH:mm:ss")}]`);

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.invitesCache = new Map();

client.once("ready", async () => {
  try {
    client.user.setPresence({
      activities: [{ name: "with Submarine! /help", type: 0 }],
      status: "idle",
    });

    client.guilds.cache.forEach(async (guild) => {
      try {
        const invites = await guild.invites.fetch();
        client.invitesCache.set(guild.id, new Map(invites.map(i => [i.code, i])));
      } catch (err) {
        console.error(`${timestamp()} ❌ Failed to fetch invites for guild ${guild.id}:`, err);
      }
    });

    console.log(`${timestamp()} ✅ Invite cache initialized for all guilds.`);
  } catch (err) {
    console.error(`${timestamp()} ❌ Error during ready handler:\n`, err);
  }
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const isOnlyMentioningBot =
    message.mentions.has(client.user) && message.mentions.users.size === 1;

  if (isOnlyMentioningBot) {
    try {
      const reply = await message.reply(
        `${message.author} - Greetings! Use \`/help\` if you need any assistance.`
      );

      setTimeout(async () => {
        await reply.delete().catch(() => {});
      }, 5000);
    } catch (err) {
      console.error(`${timestamp()} ⚠️ Failed to handle mention reply:`, err);
    }
  }

  if (message.content.toLowerCase() === "w.help") {
    await message.reply(
      `${message.author} - There will never be prefixes, fuckass boy.`
    );
  }
});

const isIgnoredError = (obj) =>
  JSON.stringify(obj).match(/(Error: read ECONNRESET|-4077|stream_base_commons:217:20)/g);

process.on("unhandledRejection", (reason, p) => {
  if (isIgnoredError(reason)) {
    return console.log(`${timestamp()} 🔄 WSS Error: Connection reset / client lost connection.`);
  }
  console.error(
    `\n${timestamp()} 🚨 ${chalk.red.bold("UNHANDLED REJECTION")}\n`,
    "Promise:", p,
    "\nReason:", reason.stack || reason
  );
});

process.on("uncaughtException", (err, origin) => {
  if (isIgnoredError(err)) return;
  console.error(
    `\n${timestamp()} 💥 ${chalk.red.bold("UNCAUGHT EXCEPTION")}\n`,
    "Origin:", origin,
    "\nError:", err.stack || err
  );
});

process.on("uncaughtExceptionMonitor", (err, origin) => {
  if (isIgnoredError(err)) return;
  console.error(
    `\n${timestamp()} 🧠 ${chalk.red.bold("UNCAUGHT EXCEPTION MONITOR")}\n`,
    "Origin:", origin,
    "\nError:", err.stack || err
  );
});

process.on("beforeExit", (code) => {
  console.log(`${timestamp()} ⏳ ${chalk.yellow("Process before exit.")} Code: ${code}`);
});

process.on("exit", (code) => {
  console.log(`${timestamp()} 🚪 ${chalk.red("Process exited.")} Code: ${code}`);
});

process.on("multipleResolves", (type, promise, reason) => {
  console.log(
    `${timestamp()} ⚠️ ${chalk.yellow("Multiple resolves detected:")}\n`,
    type,
    promise,
    reason
  );
});

eventHandler(client);
client.login(process.env.TOKEN);
