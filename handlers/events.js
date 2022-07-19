const { readdirSync } = require('fs');

module.exports = (client) => {
  readdirSync('./events').forEach((event) => {
    require(`../events/${event}`)(client);
  });
};
