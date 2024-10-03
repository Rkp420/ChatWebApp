const mongoose = require("mongoose");

const archivedGroupConversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    archivedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

// Index for faster lookups
archivedGroupConversationSchema.index({ user: 1, group: 1 });

module.exports = mongoose.model(
  "ArchivedGroupConversation",
  archivedGroupConversationSchema
);
