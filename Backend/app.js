const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cookieparser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
const isLoggedIn = require("./utils/isLoggedIn.js");
const handler = require("./utils/upload.js");
const setUpSocket = require("./socket.js");
const {
  loginUser,
  registerUser,
  getUserByToken,
  updateUser,
  logoutUser,
  getAllUser,
} = require("./controller/userController.js");
const {
  createConversation,
  deleteConversation,
} = require("./controller/individualConversation.js");
const {
  createGroup,
  deleteGroup,
  leaveGroup,
  updateGroup,
  addGroupMember,
  removeGroupMember,
  updateMemberRole,
} = require("./controller/groupConversation.js");
const { createMessage, deleteMessage } = require("./controller/message.js");

const app = express();

const mongoUrl = process.env.MONGO_URL;

mongoose.connect(mongoUrl).then(console.log("Database is Connected"));

//Logger Middleware
app.use(morgan("common"));
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

app.get("/", (req, res) => {
  res.status(200).json({
    success: "True",
    message: "This is the root",
  });
});

//For Uploading any Image
app.post("/api/upload", isLoggedIn, handler);

//User Route
app.get("/api/user/:clientToken", isLoggedIn, getUserByToken);
app.get("/api/user/all/:userId", isLoggedIn, getAllUser);
app.get("/api/logout", isLoggedIn, logoutUser);
app.post("/api/login", loginUser);
app.post("/api/register", registerUser);
app.post("/api/update/user/", isLoggedIn, updateUser);

//Conversations Route
app.post("/api/new/conversation", isLoggedIn, createConversation);
app.delete("/api/delete/conversation/:senderId/:receiverId", isLoggedIn, deleteConversation);

//Group Route
app.post("/api/new/group", isLoggedIn, createGroup);
app.post("/api/leave/group/:groupId", isLoggedIn, leaveGroup);
app.put("/api/update/group/:groupId", isLoggedIn, updateGroup);
app.put("/api/addMember/group/:groupId", isLoggedIn, addGroupMember);
app.put("/api/removeMember/group/:groupId", removeGroupMember);
app.put("/api/updateMemberRole/group/:groupId", updateMemberRole);
app.delete("/api/delete/group/:groupId", isLoggedIn, deleteGroup);

//Message Route
app.post("/api/new/message", isLoggedIn, createMessage);
app.delete("/api/delete/message/:messageId", isLoggedIn, deleteMessage);

// **Global Error Handling Middleware**
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const server = app.listen(5050, () => {
  console.log("server is Listening");
});

setUpSocket(server);

// **Graceful Shutdown Logic**
// process.on("SIGINT", async () => {
//   console.log("Shutting down server...");
//   await mongoose.connection.close();
//   server.close(() => {
//     console.log("Server shut down gracefully");
//     process.exit(0);
//   });
// });
