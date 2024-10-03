const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profile: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    location: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
      match: /^[0-9]{10,15}$/, // Ensure this regex fits your requirements
    },
    dob: {
      type: Date,
    },

    // Reference to individual conversations the user is part of
    individualConversations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "IndividualConversation",
      },
    ],

    // Reference to group conversations the user is part of
    groupConversations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GroupConversation",
      },
    ],
  },
  { timestamps: true } // Automatically manage createdAt and updatedAt fields
);

// Exclude password field from JSON output
UserSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.password; // Exclude password from JSON output
    return ret;
  },
});

module.exports = mongoose.model("User", UserSchema);
