// app.js
const express = require("express");
const globalErrorHandler = require("./middlewares/globalErrorHandler");
const apiRoutes = require("./routes");
const initMiddleware = require("./middlewares/initmiddlewares");

const app = express();

// Initialize all middlewares
initMiddleware(app);

// API Route Middleware
app.use("/api", apiRoutes);

// Global Error Handling Middleware
app.use(globalErrorHandler);

module.exports = app;
