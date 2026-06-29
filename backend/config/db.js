// config/db.js
const mongoose = require("mongoose");
const Logger = require("../patterns/singleton/Logger");

const logger = Logger.getInstance();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
