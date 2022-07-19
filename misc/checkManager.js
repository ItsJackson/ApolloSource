
const { Guild, GuildMember, TextChannel } = require('discord.js');
const guildSchema = require('../Models/Guild');

/**
 * @param {GuildMember} member
 * @param {TextChannel} channel
 * @param {Guild} guild
 */

module.exports = async (member, channel, guild) => {
  const userPermissions = channel.permissionsFor(member).toArray();

  if (userPermissions.includes('ADMINISTRATOR')) return { manager: true };

  const guildData = await guildSchema.findOne({
    GuildID: guild.id
  });

  if (!guildData?.suggestionsManager) {
    if (userPermissions.includes('ADMINISTRATOR')) return { manager: true };
    else {
      return {
        manager: false,
        reason: '**Administrator** permissions.'
      };
    }
  } else {
    const hasRole = member.roles.cache.get(guildData.suggestionsManager);
    if (hasRole) return { manager: true };
    else {
      return {
        manager: false,
        reason: 'The suggestions manager role.'
      };
    }
  }
};
