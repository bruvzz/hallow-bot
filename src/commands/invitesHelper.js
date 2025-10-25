const fs = require("fs");
const path = require("path");

const invitesPath = path.join(__dirname, "invites.json");

function loadInvites() {
  if (!fs.existsSync(invitesPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(invitesPath, "utf8"));
  } catch (err) {
    console.error("Error reading invites.json:", err);
    return {};
  }
}

function saveInvites(data) {
  try {
    fs.writeFileSync(invitesPath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error saving invites.json:", err);
  }
}

function registerInvite(inviterId, invitedUserId) {
  const data = loadInvites();

  if (!data[inviterId]) data[inviterId] = [];

  if (data[inviterId].includes(invitedUserId)) return false;

  data[inviterId].push(invitedUserId);
  saveInvites(data);
  console.log(`[Invite Tracker] ${inviterId} invited ${invitedUserId} (unique)`);

  return true;
}

module.exports = {
  loadInvites,
  saveInvites,
  registerInvite,
};
