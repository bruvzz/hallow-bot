const fs = require("fs");
const path = require("path");

const candyPath = path.join(__dirname, "candy.json");

function loadCandy() {
  if (!fs.existsSync(candyPath)) return {};
  return JSON.parse(fs.readFileSync(candyPath, "utf8"));
}

function saveCandy(data) {
  fs.writeFileSync(candyPath, JSON.stringify(data, null, 2));
}

function addCandy(userId, amount) {
  const candyData = loadCandy();
  if (!candyData[userId]) candyData[userId] = { candy: 0, inviteCounter: 0 };
  candyData[userId].candy += amount;
  saveCandy(candyData);
}

function getCandy(userId) {
  const candyData = loadCandy();
  return candyData[userId]?.candy || 0;
}

function addInvite(userId) {
  const candyData = loadCandy();
  if (!candyData[userId]) candyData[userId] = { candy: 0, inviteCounter: 0 };
  
  candyData[userId].inviteCounter = (candyData[userId].inviteCounter || 0) + 1;

  let candyRewarded = 0;

  if (candyData[userId].inviteCounter >= 5) {
    candyData[userId].candy += 5;
    candyData[userId].inviteCounter -= 5;
    candyRewarded = 5;
  }

  saveCandy(candyData);
  return candyRewarded;
}

module.exports = { addCandy, getCandy, addInvite };
