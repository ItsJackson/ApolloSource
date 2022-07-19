require('dotenv').config();

const { readdirSync } = require('fs');
const { Intents, Client } = require('discord.js');

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_BANS

  ],
  allowedMentions: { repliedUser: false, parse: ['users'] },
  partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});

readdirSync('./handlers').forEach((file) => {
  require(`./handlers/${file}`)(client);
});
Object.assign(client, require('./misc/utils'));

client.login(process.env.CLIENT_TOKEN);
