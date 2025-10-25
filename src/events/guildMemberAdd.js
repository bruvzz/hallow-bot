const { addInvite } = require("../commands/candyHelper");
const { registerInvite, loadInvites } = require("../commands/invitesHelper");

module.exports = {
  name: "guildMemberAdd",

  callback: async (client, member) => {
    try {
      const guildId = member.guild.id;

      console.log(`[Invite Debug] ${member.user.tag} joined ${member.guild.name}`);
      await new Promise(res => setTimeout(res, 1500));

      const newInvites = await member.guild.invites.fetch().catch(() => null);
      if (!newInvites) {
        console.log(`[Invite Debug] Failed to fetch invites for ${member.guild.name}`);
        return;
      }

      const cachedInvites = client.invitesCache.get(guildId) || new Map();
      const invitesData = loadInvites();

      let usedInvite = null;

      for (const invite of newInvites.values()) {
        const inviterId = invite.inviter?.id;
        if (!inviterId) continue;

        const prevUses = cachedInvites.get(invite.code)?.uses || 0;

        if (invitesData[inviterId]?.includes(member.id)) continue;

        if (invite.uses > prevUses) {
          usedInvite = invite;
          break;
        }
      }

      if (!usedInvite) {
        console.log(`[Invite Debug] No new unique invite detected for ${member.user.tag}`);
        client.invitesCache.set(guildId, new Map(newInvites.map(i => [i.code, i])));
        return;
      }

      const inviterId = usedInvite.inviter.id;
      const invitedUserId = member.id;

      console.log(`[Invite Debug] Detected invite ${usedInvite.code} by ${usedInvite.inviter.tag}`);

      const isUnique = registerInvite(inviterId, invitedUserId);
      if (!isUnique) {
        console.log(`[Invite System] ${member.user.tag} was already invited by ${usedInvite.inviter.tag}. Ignoring.`);
        client.invitesCache.set(guildId, new Map(newInvites.map(i => [i.code, i])));
        return;
      }

      console.log(`[Invite System] ${usedInvite.inviter.tag} invited ${member.user.tag} (unique)`);

      const bonusCandy = addInvite(inviterId);
      if (bonusCandy > 0) {
        try {
          const inviterUser = await client.users.fetch(inviterId);
          inviterUser.send(`🎃 Congrats! You earned **${bonusCandy} 🍬 candy points** for 5 unique invites!`);
        } catch (err) {
          console.error(`Failed to DM inviter ${inviterId}:`, err);
        }
      }

      client.invitesCache.set(guildId, new Map(newInvites.map(i => [i.code, i])));

    } catch (err) {
      console.error("❌ Error in guildMemberAdd event:", err);
    }
  },
};
