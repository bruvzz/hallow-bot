const fs = require("fs");
const path = require("path");
const { addCandy } = require("./candyHelper");

const levelsPath = path.resolve(__dirname, "levels.json");

function loadLevelData() {
  if (!fs.existsSync(levelsPath)) return {};
  return JSON.parse(fs.readFileSync(levelsPath, "utf8"));
}

function saveLevelData(data) {
  fs.writeFileSync(levelsPath, JSON.stringify(data, null, 2));
}

function getLevelFromXP(xp) {
  return Math.floor(xp / 25);
}

function addXP(userId) {
  const levels = loadLevelData();

  if (!levels[userId]) levels[userId] = { xp: 0, level: 0 };

  const xpGain = Math.floor(Math.random() * 2) + 1;
  levels[userId].xp += xpGain;

  const newLevel = getLevelFromXP(levels[userId].xp);
  const leveledUp = newLevel > levels[userId].level;

  if (leveledUp) {
    const candyReward = Math.floor(Math.random() * 2) + 1;
    addCandy(userId, candyReward);
  }

  levels[userId].level = newLevel;
  saveLevelData(levels);

  return {
    xpGained: xpGain,
    leveledUp,
    currentLevel: newLevel,
    currentXP: levels[userId].xp,
  };
}

function getUserLevel(userId) {
  const levels = loadLevelData();
  return levels[userId] || { xp: 0, level: 0 };
}

module.exports = {
  loadLevelData,
  saveLevelData,
  getLevelFromXP,
  addXP,
  getUserLevel,
};
