const Guild = require('../Models/Guild');
const {
  Modal,
  TextInputComponent,
  MessageActionRow,
  Constants,
  MessageEmbed,
  Client
} = require('discord.js');
const checkManager = require('../misc/checkManager');
const userSchema = require('../Models/User');
const checkMod = require('../misc/checkMod');
/**
 *
 * @param {Client} client
 */
module.exports = (client) => {
  client.on('interactionCreate', async (interaction) => {
    if (interaction.isCommand()) {
      const blacklistData = await userSchema.findOne({
        userID: interaction.user.id
      });

      if (blacklistData && blacklistData.blacklisted) {
        return interaction.reply({
          content: 'You have been blacklisted from using Apollo.',
          ephemeral: true
        });
      }

      const { commandName } = interaction;
      const command = client.commands.get(commandName);

      if (!command) {
        return interaction.reply({
          content: `I was unable to fetch the \`/${commandName}\` command from my directory. Please report this <:At:917156542556557342> discord.gg/7RwQF3cjYw`,
          ephemeral: true
        });
      }

      if (command?.botPermissions?.length) {
        const noPerms = new Array();
        const botPerms = interaction.channel.permissionsFor(client.user).toArray();
        command.botPermissions.forEach((perm) => {
          if (!botPerms.includes(perm)) noPerms.push(perm);
        });

        if (noPerms.length) {
          return interaction.reply({
            content: `I would require ${noPerms.map((perm) => `**${perm.toLowerCase()
                        .replace(/_/g, ' ')
                        .replace(/-/g, ' ')
                        .replace(/\b[a-zA-Z]/g, (m) => m.toUpperCase())}**`).join(', ')} ${noPerms.length === 1 ? 'permission' : 'permissions'} to use the \`/${interaction.commandName}\` command.`,
            ephemeral: true
          });
        }
      }

      if (command?.userPermissions?.length) {
        const noPerms = new Array();
        const userPerms = interaction.channel.permissionsFor(interaction.user).toArray();
        command.userPermissions.forEach((perm) => {
          if (!userPerms.includes(perm)) noPerms.push(perm);
        });

        if (noPerms.length) {
          return interaction.reply({
            content: `You would require ${noPerms.map((perm) => `**${perm.toLowerCase()
                        .replace(/_/g, ' ')
                        .replace(/-/g, ' ')
                        .replace(/\b[a-zA-Z]/g, (m) => m.toUpperCase())}**`).join(', ')} ${noPerms.length === 1 ? 'permission' : 'permissions'} to use the \`/${interaction.commandName}\` command.`,
            ephemeral: true
          });
        }
      }

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.log(error);
        return interaction.reply({
          content: `There was an unexpected error while trying to execute the \`/${commandName}\` command. Please report this <:At:917156542556557342> discord.gg/7RwQF3cjYw`,
          ephemeral: true
        });
      }
    }
    if (interaction.isButton() || interaction.isModalSubmit()) {
      if (interaction.customId === 'add_note_suggest') {
        const isMod = await checkMod(interaction.guild, interaction.member, interaction.channel);
        if (!isMod.mod) {
          return interaction.reply({
            content: `You do not have ${isMod.reason}`,
            ephemeral: true
          });
        }
        const modal = new Modal()
          .setCustomId('suggestion_note_add')
          .setTitle('Add a note to the suggestion');

        const notes = new TextInputComponent()
          .setCustomId('suggestion_note')
          .setLabel('Suggestion note')
          .setPlaceholder('Put your note here.')
          .setStyle(Constants.TextInputStyles.SHORT);

        const row = [notes].map(
          (component) =>
            new MessageActionRow().addComponents(component)
        );

        modal.addComponents(...row);

        await interaction.showModal(modal);
      }

      if (interaction.customId === 'suggestion_upvote') {
        const data = await Guild.findOne({ GuildID: interaction.guild.id });
        if (!data?.suggestions?.length) {
          return interaction.reply({
            content: 'I was unable to find this suggestion.',
            ephemeral: true
          });
        }

        const suggestions = data.suggestions || [];
        const suggestion = suggestions.find((suggestion) => suggestion.messageid === interaction.message.id);

        if (!suggestion) {
          return interaction.reply({
            content: 'I was unable to find this suggestion.',
            ephemeral: true
          });
        }

        if (suggestion.upvotes.includes(interaction.user.id) || suggestion.downvotes.includes(interaction.user.id)) {
          return interaction.reply({
            content: 'You have already interacted with this suggestion.',
            ephemeral: true
          });
        }
        suggestion.upvotes.push(interaction.user.id);

        const index = suggestions.findIndex((suggestion) => suggestion.messageid === interaction.message.id);
        suggestions.splice(index, 1);
        suggestions.push(suggestion);

        console.log(JSON.stringify(suggestions));

        interaction.reply({
          content: 'You upvoted this suggestion!',
          ephemeral: true
        });

        await Guild.findOneAndUpdate(
          {
            GuildID: interaction.guild.id
          },
          {
            GuildID: interaction.guild.id,
            $set: {
              suggestions
            }
          },
          {
            upsert: true
          }
        );
      }

      if (interaction.customId === 'suggestion_downvote') {
        const data = await Guild.findOne({ GuildID: interaction.guild.id });
        if (!data?.suggestions?.length) {
          return interaction.reply({
            content: 'I was unable to find this suggestion.',
            ephemeral: true
          });
        }

        const suggestions = data.suggestions || [];
        const suggestion = suggestions.find((suggestion) => suggestion.messageid === interaction.message.id);

        if (!suggestion) {
          return interaction.reply({
            content: 'I was unable to find this suggestion.',
            ephemeral: true
          });
        }

        if (suggestion.downvotes.includes(interaction.user.id) || suggestion.upvotes.includes(interaction.user.id)) {
          return interaction.reply({
            content: 'You have already interacted with this suggestion.',
            ephemeral: true
          });
        }
        suggestion.downvotes.push(interaction.user.id);

        const index = suggestions.findIndex((suggestion) => suggestion.messageid === interaction.message.id);
        suggestions.splice(index, 1);
        suggestions.push(suggestion);

        console.log(JSON.stringify(suggestions));

        interaction.reply({
          content: 'You downvoted this suggestion!',
          ephemeral: true
        });

        await Guild.findOneAndUpdate(
          {
            GuildID: interaction.guild.id
          },
          {
            GuildID: interaction.guild.id,
            $set: {
              suggestions
            }
          },
          {
            upsert: true
          }
        );
      }

      if (interaction.customId === 'admin_accept') {
        const isManager = await checkManager(interaction.member, interaction.channel, interaction.guild);
        if (!isManager.manager) {
          return interaction.reply({
            content: `You do not have ${isManager.reason}`,
            ephemeral: true
          });
        }
        const data = await Guild.findOne({ GuildID: interaction.guild.id });
        if (!data?.suggestions?.length) {
          return interaction.reply({
            content: 'I was unable to locate this suggestion.',
            ephemeral: true
          });
        }

        const suggestions = data.suggestions || [];
        const suggestion = suggestions.find((suggestion) => suggestion.messageid === interaction.message.id);

        if (!suggestion) {
          return interaction.reply({
            content: 'I was unable to find this suggestion.',
            ephemeral: true
          });
        }

        const postData = suggestion.messageid;

        const oldMessage = await interaction.guild.channels.cache.get(data.suggestionsChannel).messages.fetch(postData);

        interaction.reply({ content: 'I accepted the suggestion!', ephemeral: true });

        await oldMessage.edit({
          embeds: [
            oldMessage.embeds[0]
              .setColor(4902021)
              .setAuthor({
                name: 'SUGGESTION ACCEPTED!',
                iconURL: 'https://cdn.discordapp.com/emojis/575412409737543694.gif?quality=lossless'
              })
          ],
          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  emoji: '👍',
                  style: 'SECONDARY',
                  disabled: true,
                  custom_id: 'upvote_disabled'
                },
                {
                  type: 2,
                  emoji: '👎',
                  style: 'SECONDARY',
                  disabled: true,
                  custom_id: 'downvote_disabled'
                }
              ]
            }
          ]
        });
      }

      if (interaction.customId === 'suggestion_note_add') {
        const firstMessage = interaction.fields.getTextInputValue('suggestion_note');
        const data = await Guild.findOne({ GuildID: interaction.guild.id });
        if (!data?.suggestions?.length) {
          return interaction.reply({
            content: 'I was unable to find this suggestion.',
            ephemeral: true
          });
        }

        const suggestions = data.suggestions || [];
        const suggestion = suggestions.find((suggestion) => suggestion.messageid === interaction.message.id);

        if (!suggestion) {
          return interaction.reply({
            content: 'I was unable to find this suggestion.',
            ephemeral: true
          });
        }
        suggestion.notes.push(firstMessage);

        const index = suggestions.findIndex((suggestion) => suggestion.messageid === interaction.message.id);
        suggestions.splice(index, 1);
        suggestions.push(suggestion);

        console.log(JSON.stringify(suggestions));

        interaction.reply({
          content: 'You added a note to this suggestion!',
          ephemeral: true
        });

        await Guild.findOneAndUpdate(
          {
            GuildID: interaction.guild.id
          },
          {
            GuildID: interaction.guild.id,
            $set: {
              suggestions
            }
          },
          {
            upsert: true
          }
        );
      }

      if (interaction.customId === 'admin_view_notes') {
        const isManager = await checkManager(interaction.member, interaction.channel, interaction.guild);
        if (!isManager.manager) {
          return interaction.reply({
            content: `You do not have ${isManager.reason}`,
            ephemeral: true
          });
        }
        const data = await Guild.findOne({ GuildID: interaction.guild.id });
        if (!data?.suggestions?.length) {
          return interaction.reply({
            content: 'I was unable to find this suggestion.',
            ephemeral: true
          });
        }

        const suggestions = data.suggestions || [];
        const suggestion = suggestions.find((suggestion) => suggestion.messageid === interaction.message.id);

        if (!suggestion) {
          return interaction.reply({
            content: 'I was unable to find this suggestion.',
            ephemeral: true
          });
        }

        const notes = suggestion.notes || [];

        const embed = new MessageEmbed()
          .setTitle('Here are the notes:')
          .setDescription(`${notes}\n\n`);

        interaction.reply({ embeds: [embed], ephemeral: true });
      }
    }

    if (interaction.customId === 'admin_deny') {
      const isManager = await checkManager(interaction.member, interaction.channel, interaction.guild);
      if (!isManager.manager) {
        return interaction.reply({
          content: `You do not have ${isManager.reason}`,
          ephemeral: true
        });
      }
      const data = await Guild.findOne({ GuildID: interaction.guild.id });
      if (!data?.suggestions?.length) {
        return interaction.reply({
          content: 'I was unable to find this suggestion.',
          ephemeral: true
        });
      }

      const suggestions = data.suggestions || [];
      const suggestion = suggestions.find((suggestion) => suggestion.messageid === interaction.message.id);

      if (!suggestion) {
        return interaction.reply({
          content: 'I was unable to find this suggestion.',
          ephemeral: true
        });
      }
      const postData = suggestion.messageid;

      const oldMessage = await interaction.guild.channels.cache.get(data.suggestionsChannel).messages.fetch(postData);

      interaction.reply({ content: 'I accepted the suggestion!', ephemeral: true });

      await oldMessage.edit({
        embeds: [
          oldMessage.embeds[0]
            .setColor(880808)
            .setAuthor({
              name: 'SUGGESTION DENIED!'
            })
        ],
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                emoji: '👍',
                style: 'SECONDARY',
                disabled: true,
                custom_id: 'upvote_disabled'
              },
              {
                type: 2,
                emoji: '👎',
                style: 'SECONDARY',
                disabled: true,
                custom_id: 'downvote_disabled'
              }
            ]
          }
        ]
      });
    }

    if (interaction.customId === 'appeal_ban') {
      const modal = new Modal()
        .setTitle('Appeal Blacklist')
        .setCustomId('appeal_black');

      const input = new TextInputComponent()
        .setLabel('Why were you blacklisted?')
        .setPlaceholder('Answer here')
        .setCustomId('question_1')
        .setStyle('PARAGRAPH');

      const input2 = new TextInputComponent()
        .setLabel('Why should we unban you from the bot?')
        .setPlaceholder('Answer here')
        .setCustomId('question_2')
        .setStyle('PARAGRAPH');

      const modalRow = [input, input2].map(
        (component) =>
          new MessageActionRow().addComponents(component)
      );

      modal.addComponents(...modalRow);

      await interaction.showModal(modal);
    }
    if (interaction.customId === 'appeal_black') {
      const input1 = interaction.fields.getTextInputValue('question_1');
      const input2 = interaction.fields.getTextInputValue('question_2');

      interaction.reply({
        content: 'Sent your appeal to the developers.'
      });

      client.channels.cache.get(process.env.APPEALS).send({
        content: `Why were you blacklisted?: ${input1}\n\nWhy should we unban you from the bot?: ${input2}. ${interaction.user.username} (${interaction.user.id}) sent this.`
      });
    }
  });
};
