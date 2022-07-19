const mongoose = require('mongoose');

module.exports = async () => {
  try {
    await mongoose
      .connect(process.env.MONGODB_SRV, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });

    return console.log('Connected to the database.');
  } catch (error) {
    return console.log('Unable to connect to the database.');
  }
};
