const mongoose = require("mongoose");

const groupConversationSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
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
    archived: {
      type: Boolean,
      default: false, // Indicates if the conversation is archived
    },
    totalMessages: {
      type: Number,
      default: 0, // Tracks the total number of messages
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message", // Reference to the last message sent
    },
    lastMessageTimestamp: {
      type: Date, // Timestamp of the last message sent
      default: null,
    },
  },
  { timestamps: true }
);

// Optional: Indexing on the group for faster lookups
groupConversationSchema.index({ group: 1 });

groupConversationSchema.pre("save", function (next) {
  // Ensure that messages is defined and is an array
  if (
    this.messages &&
    Array.isArray(this.messages) &&
    this.messages.length > 0
  ) {
    this.totalMessages = this.messages.length;
    this.lastMessage = this.messages[this.messages.length - 1]; // Get the last message
  } else {
    // Set default values if there are no messages
    this.totalMessages = 0;
    this.lastMessage = null; // Or set it to some default value like an empty string or message object
  }
  next();
});


module.exports = mongoose.model("GroupConversation", groupConversationSchema);
