const express = require("express");
const router = express.Router();
const isLoggedIn = require("../../middlewares/authMiddleware.js");
const handler = require("../../utils/upload.js");
const {
  loginUser,
  registerUser,
  getUserByToken,
  updateUser,
  logoutUser,
  getAllUser,
} = require("../../controller/userController.js");
const {
  createConversation,
  deleteConversation,
} = require("../../controller/individualConversation.js");
const {
  createGroup,
  deleteGroup,
  leaveGroup,
  updateGroup,
  addGroupMember,
  removeGroupMember,
  updateMemberRole,
} = require("../../controller/groupConversation.js");
const { createMessage, deleteMessage } = require("../../controller/message.js");

//For Uploading any Image
router.post("/upload", isLoggedIn, handler);

//User Route
router.get("/user/:clientToken", isLoggedIn, getUserByToken);
router.get("/user/all/:userId", isLoggedIn, getAllUser);
router.get("/logout", isLoggedIn, logoutUser);
router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/update/user/", isLoggedIn, updateUser);

//Conversations Route
router.post("/new/conversation", isLoggedIn, createConversation);
router.delete(
  "/delete/conversation/:senderId/:receiverId",
  isLoggedIn,
  deleteConversation
);

//Group Route
router.post("/new/group", isLoggedIn, createGroup);
router.post("/leave/group/:groupId", isLoggedIn, leaveGroup);
router.put("/update/group/:groupId", isLoggedIn, updateGroup);
router.put("/addMember/group/:groupId", isLoggedIn, addGroupMember);
router.put("/removeMember/group/:groupId", removeGroupMember);
router.put("/updateMemberRole/group/:groupId", updateMemberRole);
router.delete("/delete/group/:groupId", isLoggedIn, deleteGroup);

//Message Route
router.post("/new/message", isLoggedIn, createMessage);
router.delete("/delete/message/:messageId", isLoggedIn, deleteMessage);

module.exports = router;
