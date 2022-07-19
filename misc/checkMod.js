const { Guild, GuildMember, TextChannel } = require('discord.js');
const guildSchema = require('../Models/Guild');
/**
     *
     * @param {Guild} guild
     * @param {GuildMember} member
     * @param {TextChannel} channel
     *
     */
module.exports = (guild, member, channel) => {
  const userPermissions = channel.permissionsFor(member).toArray();

  if (userPermissions.includes('ADMINISTRATOR')) return { mod: true };
  const guildData = guildSchema.findOne({
    GuildID: guild.id
  });

  if (!guildData?.ModRole) {
    if (userPermissions.includes('MANAGE_MESSAGES')) return { mod: true };
    else {
      return {
        mod: false,
        reason: '**Manage Messages** permissions'
      };
    }
  } else {
    const hasRole = member.roles.cache.get(guildData.ModRole);
    if (hasRole) return { mod: true };
    else {
      return {
        mod: false,
        reason: 'the Moderator role'
      };
    }
  }
};
