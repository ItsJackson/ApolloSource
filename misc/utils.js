
const { GuildMember } = require('discord.js');
const guildSchema = require('../Models/Guild');

const validImageTypes = ['png', 'gif', 'jpeg', 'jpg', 'webp'];

module.exports = {

  /**
     * @param {Array} arr The aray to pick a random string from
     */
  randomInArray: (arr) => {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  /**
     *
     * @param {String} text The text to convert normally.
     */

  normalText: (text) => {
    return text.toLowerCase()
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .replace(/\b[a-zA-Z]/g, (m) => m.toUpperCase());
  },

  /**
   * 
   * @param {String} str 
   */
  capitalize: (str) => {
    return str.replace(
      /\w\S*/g,
      function(txt) {
        if(txt.charAt(0) == "'") {
          return 
        } else {
          return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
        }
      }
    )
  },

  /**
     *
     * @param {String} timestamp The timestamp to convert.
     */

  Unix: (timestamp) => {
    return parseInt(new Date(timestamp).getTime() / 1000).toFixed(0);
  },

  /**
     *
     * @param {Number} length Length (in numbers) to generate a generic ID.
     */
  createID: (length) => {
    const chars = '12345678910abcdefghijklmnopqrstuvwxyz'; // all letters and numbers

    let random_string = '';

    if (length > 0) {
      for (let i = 0; i < length; i++) {
        random_string += chars.charAt(
          Math.floor(Math.random() * chars.length)
        );
      }
    }
    return random_string;
  },

  /**
     * @param {String} url The "image" url to validate the suffix.
     * @param {String} contentType The content type field from a resolved image.
     * @returns {Boolean} True if it's a valid image, false otherwise.
     */
  validateImage: (url, contentType = 'image') => {
    if (!url) return false;
    const [suffix] = url.split('.').slice(-1);
    if (validImageTypes.includes(suffix) && contentType.includes('image')) {
      return true;
    }
  },
  /**
     * @param {String} text The text to markup
     * @param {String} url The url to mark up the text with
     */

  Hypertext: (text, url) => {
    if (!url) throw new Error('Include a URL');
    if (!text) throw new Error('Include text.');
    return `[${text}](${url})`;
  }
};
