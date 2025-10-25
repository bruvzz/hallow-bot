const fs = require("fs");
const path = require("path");

module.exports = (client) => {
  const eventsPath = path.join(__dirname, "..");
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));

  for (const file of eventFiles) {
    const event = require(path.join(eventsPath, file));

    if (event.name && typeof event.callback === "function") {
      client.on(event.name, (...args) => event.callback(client, ...args));
      console.log(`✅ Loaded event: ${event.name}`);
    } else {
      console.log(`⚠️ Skipping non-event file: ${file}`);
    }
  }

  const folders = fs.readdirSync(eventsPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const folder of folders) {
    const folderPath = path.join(eventsPath, folder);
    const folderFiles = fs.readdirSync(folderPath).filter(file => file.endsWith(".js"));

    for (const file of folderFiles) {
      const event = require(path.join(folderPath, file));
      if (event.name && typeof event.callback === "function") {
        client.on(event.name, (...args) => event.callback(client, ...args));
        console.log(`✅ Loaded event: ${event.name}`);
      } else {
        console.log(`⚠️ Skipping non-event file: ${folder}/${file}`);
      }
    }
  }
};
