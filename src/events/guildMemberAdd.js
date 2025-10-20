const { addInvite } = require("../commands/candyHelper");

module.exports = {
  name: "guildMemberAdd",
  /**
   *
   * @param {import("discord.js").Client} client
   * @param {import("discord.js").GuildMember} member
   */
  callback: async (client, member) => {
    try {
      const cachedInvites = client.invitesCache.get(member.guild.id);
      const newInvites = await member.guild.invites.fetch();
      const usedInvite = newInvites.find(
        i => cachedInvites.get(i.code)?.uses < i.uses
      );

      if (!usedInvite || !usedInvite.inviter) return;

      const inviterId = usedInvite.inviter.id;
      const candyReward = addInvite(inviterId);
      if (candyReward > 0) {
        const inviterUser = await client.users.fetch(inviterId);
        inviterUser.send(
          `🎃 Congrats! You earned **${candyReward} 🍬 candy points** for 5 successful invites!`
        );
      }

      client.invitesCache.set(member.guild.id, newInvites);
    } catch (err) {
      console.error("Error in guildMemberAdd event:", err);
    }
  },
};
