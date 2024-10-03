const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema(
  {
    groupname: {
      type: String,
      required: true,
      trim: true, // Trim whitespace
      minlength: 3, // Minimum length validation
      maxlength: 100, // Maximum length validation
    },

    profile: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },

    moto: {
      type: String,
      default: "Bakchodi",
    },

    bio: {
      type: String,
      default: "Azi land Mera",
    },

    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["admin", "member"],
          default: "member",
        },
      },
    ],
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

// Index the groupname field for faster search if needed
GroupSchema.index({ groupname: 1 });

module.exports = mongoose.model("Group", GroupSchema);
