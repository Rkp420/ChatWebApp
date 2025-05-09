const mongoose = require("mongoose");
const serverConfig = require("./server-config");

const connectDb = async (mongoUrl = serverConfig.MongoUrl) => {
  try {
    await mongoose.connect(mongoUrl);
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDb;
