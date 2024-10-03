const mongoose = require("mongoose");

const archivedIndividualConversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
  },
  archivedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model(
  "ArchivedIndividualConversation",
  archivedIndividualConversationSchema
);
