const { 
  addInvite, 
} = require("../commands/candyHelper");

module.exports = {
  name: "guildMemberAdd",
  /**
   *
   * @param {import("discord.js").Client} client
   * @param {import("discord.js").GuildMember} member
   */
  callback: async (client, member) => {
    try {
      const cachedInvites = client.invitesCache.get(member.guild.id) || new Map();
      const newInvites = await member.guild.invites.fetch();

      const usedInvite = newInvites.find(
        i => (cachedInvites.get(i.code)?.uses || 0) < i.uses
      );

      if (!usedInvite || !usedInvite.inviter) return;

      const inviterId = usedInvite.inviter.id;

      const bonusCandy = addInvite(inviterId);

      if (bonusCandy > 0) {
        try {
          const inviterUser = await client.users.fetch(inviterId);
          inviterUser.send(
            `🎃 Congrats! You earned **${bonusCandy} 🍬 candy points** for reaching 5 successful invites!`
          );
        } catch (err) {
          console.error(`Failed to DM inviter ${inviterId}:`, err);
        }
      }

      client.invitesCache.set(member.guild.id, new Map(newInvites.map(i => [i.code, i])));
    } catch (err) {
      console.error("Error in guildMemberAdd event:", err);
    }
  },
};
