// db.js
const mongoose = require('mongoose');

const RETRY_DELAY = 5000; 

async function connectDB() {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    console.error('\x1b[31m%s\x1b[0m', '❌ MONGO_URI missing in .env');
    process.exit(1);
  }

  const connectWithRetry = async () => {
    try {
      mongoose.set('strictQuery', true);

      await mongoose.connect(mongoURI, {
        autoIndex: process.env.NODE_ENV !== 'production',
        serverSelectionTimeoutMS: 10000,
      });

      console.log('\x1b[32m%s\x1b[0m', '✅ MongoDB connected successfully');

    } catch (err) {
      console.error(
        '\x1b[31m%s\x1b[0m',
        `❌ MongoDB not ready yet: ${err.message}`
      );
      console.log(
        '\x1b[33m%s\x1b[0m',
        `🔄 Waiting ${RETRY_DELAY / 1000} seconds before retry...`
      );
      setTimeout(connectWithRetry, RETRY_DELAY);
    }
  };

  connectWithRetry();
}

module.exports = connectDB;
