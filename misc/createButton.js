const { MessageButton, Constants } = require('discord.js');

/**
 * @param {String} customId The customid for the button.
 * @param {String} label The label for the button.
 * @param {Number} style The style of the button {@link https://discord.com/developers/docs/interactions/message-components#buttons}
 * @param {Boolean} disabled If the button is to be disabled or not.
  */

module.exports = (customId, label, style, disabled) => {
  return (
    new MessageButton()
      .setCustomId(customId)
      .setLabel(label)
      .setStyle(style)
      .setDisabled(disabled)
  );
};
