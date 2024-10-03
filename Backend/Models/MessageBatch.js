const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "conversationModel", // Dynamically reference the model based on conversationModel
  },
  conversationModel: {
    type: String,
    required: true,
    enum: ["IndividualConversation", "GroupConversation"], // Models to reference
  },
  messages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MessageContent",
      required: true,
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Middleware to update `updatedAt` on save
messageSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Ensure index on conversation for faster queries
messageSchema.index({ conversation: 1, createdAt: -1 });

module.exports = mongoose.model("MessageBatch", messageSchema);
