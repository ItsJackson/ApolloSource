module.exports = (client) => {
  client.on('ready', () => {
    console.log(`${client.user.username} is ready.`);
  });
};
