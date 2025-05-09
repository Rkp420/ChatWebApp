// server.js
const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const app = require("./app");
const { serverConfig, connectDb } = require("./config");
const setUpSocket = require("./socket");

const PORT = serverConfig.PORT || 5000;

// Connect DB first
connectDb();

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});

// Setup WebSocket (socket.io or other)
setUpSocket(server);

// Graceful shutdown (SIGINT - Ctrl+C)
process.on("SIGINT", async () => {
  console.log("🛑 Shutting down server...");
  await mongoose.connection.close();
  server.close(() => {
    console.log("✅ Server shut down gracefully");
    process.exit(0);
  });
});

// Handle unhandled rejections (recommended)
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions (recommended)
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  server.close(() => process.exit(1));
});
