const mongoose = require("mongoose");

const individualConversationSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messageBatch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MessageBatch", // Reference to a single MessageBatch
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isArchived: {
      type: Boolean,
      default: false, // Initialize with false
    },
    messageCount: {
      type: Number,
      default: 0, // Initialize with 0
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message", // Reference to the last message in the conversation
    },
  },
  { timestamps: true }
);

// Prevent multiple conversations between the same two users
individualConversationSchema.index(
  { sender: 1, receiver: 1 },
  { unique: true }
);

// Validation to prevent sender and receiver from being the same
individualConversationSchema.pre("validate", function (next) {
  if (this.sender.equals(this.receiver)) {
    return next(new Error("Sender and receiver cannot be the same user."));
  }
  next();
});

// Export the model
module.exports = mongoose.model(
  "IndividualConversation",
  individualConversationSchema
);
