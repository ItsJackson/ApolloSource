const { readdirSync } = require('fs');
const { Collection } = require('discord.js');

module.exports = (client) => {
  client.commands = new Collection();

  const cmdFiles = readdirSync('./commands');
  client.categories = cmdFiles.map((folder) => `${folder.charAt(0).toUpperCase()}${folder.substring(1)}`);

  cmdFiles.forEach((folder) => {
    readdirSync(`./commands/${folder}`)
      .filter((file) => file.endsWith('.js'))
      .forEach((file) => {
        const data = require(`../commands/${folder}/${file}`);
        if (!data.name) return;

        client.commands.set(data.name, data); // data.name, data
      });
  });

  const slashCommands = client.commands.map((command) => {
    return {
      name: command.name,
      description: command?.description || '🚧 This command is still under work.',
      type: 'CHAT_INPUT',
      options: command?.options || null
    };
  });

  if (slashCommands.length) {
    setTimeout(async () => {
      try {
        await client.application.commands.set(slashCommands);
        return console.log('Loaded all the slash commands.');
      } catch (error) {
        console.log(error);
        return console.log('There was an error while trying to create the slash commands.');
      }
    }, 5000);
  }
};
