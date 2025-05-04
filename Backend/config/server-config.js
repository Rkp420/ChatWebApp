require("dotenv").config();

module.exports = {
  PORT: process.env.PORT,
  MongoUrl: process.env.MONGO_URL,
};
