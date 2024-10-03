const mongoose = require("mongoose");

const messageContentSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: function () {
      return this.messageType === "text";
    },
  },
  fileUrl: {
    type: String,
    required: function () {
      return this.messageType === "file";
    },
  },
  messageType: {
    type: String,
    enum: ["text", "file"],
    required: true,
  },
  timestamp: { type: Date, default: Date.now },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("MessageContent", messageContentSchema);
