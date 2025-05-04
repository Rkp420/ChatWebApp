const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cookieparser = require("cookie-parser");
const cors = require("cors");

const { serverConfig } = require('./config');
const apiRoutes = require('./routes');
const setUpSocket = require("./socket.js");

const app = express();
mongoose
  .connect(serverConfig.MongoUrl)
  .then(console.log("Database is Connected"));

// Logger Middleware
app.use(morgan("common"));

// Middleware to Receive Data in Req.body
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieparser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.static("public"));

// Api Route Middleware
app.use("/api", apiRoutes);


// **Global Error Handling Middleware**
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const server = app.listen(serverConfig.PORT, () => {
  console.log(`server is Listening ${serverConfig.PORT}`);
});

setUpSocket(server);

// **Graceful Shutdown Logic**
process.on("SIGINT", async () => {
  console.log("Shutting down server...");
  await mongoose.connection.close();
  server.close(() => {
    console.log("Server shut down gracefully");
    process.exit(0);
  });
});
