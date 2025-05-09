const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const corsConfig = require("../config/cors-config.js");

const initMiddleware = (app) => {
  if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  } else {
    app.use(morgan("common"));
  }

  // Body parsers
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Static files
  app.use(express.static("public"));

  // Cookie parser
  app.use(cookieParser());

  // CORS
  app.use(corsConfig());
};

module.exports = initMiddleware;